// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Secrets {
    address public immutable platformOwner;
    uint256 public immutable platformFeeBips; // e.g. 500 = 5%

    struct Secret {
        uint256 id;
        address owner;
        string title;
        string description;
        string content;
        uint256 price;
    }
    Secret[] public secrets;

    uint256 public platformBalance;
    mapping(address => uint256) public balances;
    mapping(string => bool) public accessKeys;

    // contract events
    event SecretAdded(uint256 indexed secretId, address owner);
    event SecretUnlocked(
        uint256 indexed secretId,
        address buyer,
        uint256 amount
    );

    // contract methods
    constructor(uint256 _feeBips) {
        platformOwner = msg.sender;
        platformFeeBips = _feeBips;
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
                owner: msg.sender,
                id: secretId,
                title: title,
                description: description,
                content: content,
                price: price
            })
        );
        emit SecretAdded(secretId, msg.sender);
        return secretId;
    }

    function unlockSecret(uint256 secretId) external payable {
        Secret storage secret = secrets[secretId];
        require(msg.value >= secret.price, "Underpaid");

        uint256 fee = (secret.price * platformFeeBips) / 10_000;
        balances[secret.owner] += secret.price - fee;
        platformBalance += fee;

        emit SecretUnlocked(secretId, msg.sender, msg.value);
    }

    function withdrawBalance() external {
        require(balances[msg.sender] > 0, "No balance to withdraw");
        payable(msg.sender).transfer(balances[msg.sender]);
        delete balances[msg.sender];
    }

    function withdrawPlatformFees() external {
        require(msg.sender == platformOwner, "Unauthorized");
        payable(platformOwner).transfer(platformBalance);
        platformBalance = 0;
    }

    function getSecretsCount() external view returns (uint256) {
        return secrets.length;
    }

    function getSecretsPaginated(
        uint256 start,
        uint256 count
    ) external view returns (Secret[] memory) {
        uint256 end = start + count;
        if (end > secrets.length) end = secrets.length;

        Secret[] memory result = new Secret[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = secrets[i];
        }
        return result;
    }
}
