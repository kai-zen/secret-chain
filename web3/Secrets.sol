// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @title Secrets marketplace with payments and access tracking
contract Secrets {
    address public immutable platformOwner;
    uint16 public immutable platformFeeBips; // e.g. 500 = 5% (max 10,000 = 100%)
    uint256 public platformBalance;

    struct Secret {
        uint96 id;
        address owner; // Packed with uint96 id in same slot
        string title;
        string description;
        string content;
        uint256 price;
    }
    struct SecretSummary {
        uint96 id;
        string title;
        uint256 price;
    }
    Secret[] private secrets;

    mapping(address => uint256) public balances;
    mapping(uint256 => mapping(address => bool)) public hasAccess;
    bool private locked;

    // Custom errors (gas efficient)
    error Unauthorized();
    error ReentrantCall();
    error InvalidSecretIndex();
    error Underpaid();
    error AlreadyHasAccess();
    error CannotBuyOwnSecret();
    error NoBalance();
    error TransferFailed();
    error InvalidRange();

    event SecretAdded(uint96 indexed secretId, address indexed owner);
    event SecretUnlocked(
        uint96 indexed secretId,
        address indexed buyer,
        uint256 price
    );
    event Withdrawn(address indexed account, uint256 amount);

    modifier onlyPlatformOwner() {
        if (msg.sender != platformOwner) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (locked) revert ReentrantCall();
        locked = true;
        _;
        locked = false;
    }

    constructor(uint16 feeBips) {
        if (feeBips > 10_000) revert InvalidRange();
        platformOwner = msg.sender;
        platformFeeBips = feeBips;
    }

    function addSecret(
        string memory title,
        string memory description,
        string memory content,
        uint256 price
    ) external returns (uint96 secretId) {
        secretId = uint96(secrets.length);
        secrets.push(
            Secret({
                id: secretId,
                owner: msg.sender,
                title: title,
                description: description,
                content: content,
                price: price
            })
        );
        emit SecretAdded(secretId, msg.sender);
    }

    function unlockSecret(uint256 secretId) external payable nonReentrant {
        if (secretId >= secrets.length) revert InvalidSecretIndex();

        Secret storage secret = secrets[secretId];
        if (secret.owner == msg.sender) revert CannotBuyOwnSecret();
        if (hasAccess[secretId][msg.sender]) revert AlreadyHasAccess();
        if (msg.value < secret.price) revert Underpaid();

        uint256 price = secret.price;
        uint256 fee = (price * platformFeeBips) / 10_000;
        uint256 sellerAmount = price - fee;

        balances[secret.owner] += sellerAmount;
        platformBalance += fee;
        hasAccess[secretId][msg.sender] = true;

        // Refund overpayment
        uint256 refund = msg.value - price;
        if (refund > 0) {
            (bool refundSent, ) = msg.sender.call{value: refund}("");
            if (!refundSent) revert TransferFailed();
        }

        emit SecretUnlocked(uint96(secretId), msg.sender, price);
    }

    function withdrawBalance() external nonReentrant {
        uint256 amount = balances[msg.sender];
        if (amount == 0) revert NoBalance();

        balances[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert TransferFailed();

        emit Withdrawn(msg.sender, amount);
    }

    function withdrawPlatformFees() external onlyPlatformOwner nonReentrant {
        uint256 amount = platformBalance;
        if (amount == 0) revert NoBalance();

        platformBalance = 0;
        (bool sent, ) = payable(platformOwner).call{value: amount}("");
        if (!sent) revert TransferFailed();
    }

    function getSecretsCount() external view returns (uint256) {
        return secrets.length;
    }

    function getSecretsPaginated(
        uint256 start,
        uint256 count
    ) external view returns (SecretSummary[] memory) {
        if (start >= secrets.length || count == 0) {
            return new SecretSummary[](0);
        }

        uint256 end = start + count;
        if (end > secrets.length) end = secrets.length;

        uint256 length = end - start;
        SecretSummary[] memory result = new SecretSummary[](length);

        unchecked {
            for (uint256 i = 0; i < length; ++i) {
                Secret storage s = secrets[start + i];
                result[i] = SecretSummary({
                    id: s.id,
                    title: s.title,
                    price: s.price
                });
            }
        }
        return result;
    }

    function getSecretDetails(
        uint256 secretId
    ) external view returns (Secret memory) {
        if (secretId >= secrets.length) revert InvalidSecretIndex();
        return secrets[secretId];
    }

    function checkAccess(
        uint256 secretId,
        address user
    ) external view returns (bool) {
        if (secretId >= secrets.length) return false;
        if (secrets[secretId].owner == user) return true;
        return hasAccess[secretId][user];
    }

    function viewSecretContent(
        uint256 secretId
    ) external view returns (string memory) {
        if (secretId >= secrets.length) revert InvalidSecretIndex();

        Secret storage secret = secrets[secretId];
        if (secret.owner != msg.sender && !hasAccess[secretId][msg.sender])
            revert Unauthorized();
        return secret.content;
    }
}
