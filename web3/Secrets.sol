// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Secrets marketplace with payments and access tracking
contract Secrets {
    address public immutable platformOwner;
    uint16 public immutable platformFeeBips; // e.g. 500 = 5%
    uint256 public platformBalance;

    struct Secret {
        uint256 id;
        address owner;
        string title;
        string description;
        string content;
        uint256 price;
    }
    Secret[] private secrets;

    mapping(address => uint256) public balances;
    mapping(uint256 => mapping(address => bool)) public hasAccess;

    // Reentrancy guard
    uint8 private constant NOT_ENTERED = 1;
    uint8 private constant ENTERED = 2;
    uint8 private status = NOT_ENTERED;

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

    event SecretAdded(uint256 indexed secretId, address indexed owner);
    event SecretUnlocked(
        uint256 indexed secretId,
        address indexed buyer,
        uint256 price
    );
    event Withdrawn(address indexed account, uint256 amount);

    modifier onlyPlatformOwner() {
        if (msg.sender != platformOwner) revert Unauthorized();
        _;
    }

    modifier nonReentrant() {
        if (status == ENTERED) revert ReentrantCall();
        status = ENTERED;
        _;
        status = NOT_ENTERED;
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
    ) external returns (uint256 secretId) {
        secretId = secrets.length;
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

    function unlockSecret(uint256 secretIndex) external payable nonReentrant {
        if (secretIndex >= secrets.length) revert InvalidSecretIndex();

        Secret storage secret = secrets[secretIndex];
        if (secret.owner == msg.sender) revert CannotBuyOwnSecret();
        if (hasAccess[secretIndex][msg.sender]) revert AlreadyHasAccess();
        if (msg.value < secret.price) revert Underpaid();

        uint256 price = secret.price;
        uint256 fee = (price * platformFeeBips) / 10_000;
        uint256 sellerAmount = price - fee;

        balances[secret.owner] += sellerAmount;
        platformBalance += fee;
        hasAccess[secretIndex][msg.sender] = true;

        // Refund overpayment
        uint256 refund = msg.value - price;
        if (refund > 0) {
            (bool refundSent, ) = msg.sender.call{value: refund}("");
            if (!refundSent) revert TransferFailed();
        }

        emit SecretUnlocked(secretIndex, msg.sender, price);
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
    ) external view returns (Secret[] memory) {
        if (start >= secrets.length || count == 0) revert InvalidRange();

        uint256 end = start + count;
        if (end > secrets.length) end = secrets.length;

        uint256 length = end - start;
        Secret[] memory result = new Secret[](length);

        unchecked {
            for (uint256 i = 0; i < length; ++i) {
                result[i] = secrets[start + i];
            }
        }
        return result;
    }

    function checkAccess(
        uint256 secretIndex,
        address user
    ) external view returns (bool) {
        if (secretIndex >= secrets.length) return false;
        if (secrets[secretIndex].owner == user) return true;
        return hasAccess[secretIndex][user];
    }

    function viewSecretContent(
        uint256 secretIndex
    ) external view returns (string memory) {
        if (secretIndex >= secrets.length) revert InvalidSecretIndex();

        Secret storage secret = secrets[secretIndex];
        if (secret.owner != msg.sender && !hasAccess[secretIndex][msg.sender])
            revert Unauthorized();
        return secret.content;
    }
}
