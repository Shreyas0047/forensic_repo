// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EvidenceContract {
    struct EvidenceRecord {
        bytes32 evidenceHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => EvidenceRecord) private evidenceRecords;

    event EvidenceStored(string indexed evidenceId, bytes32 evidenceHash, uint256 timestamp);

    function storeEvidence(bytes32 evidenceHash, string memory evidenceId) external {
        require(bytes(evidenceId).length > 0, "Evidence ID required");
        require(evidenceHash != bytes32(0), "Evidence hash required");

        evidenceRecords[evidenceId] = EvidenceRecord({
            evidenceHash: evidenceHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit EvidenceStored(evidenceId, evidenceHash, block.timestamp);
    }

    function getEvidence(string memory evidenceId) external view returns (bytes32, uint256) {
        EvidenceRecord memory record = evidenceRecords[evidenceId];
        require(record.exists, "Evidence not found");

        return (record.evidenceHash, record.timestamp);
    }
}
