# The Delta Transaction Protocol

Delta files are stored as JSON in a directory at the root of the table named _delta_log, and together with checkpoints make up the log of all changes that have occurred to a table.

Delta files are the unit of atomicity for a table, and are named using the next available version number, zero-padded to 20 digits.

For eg:
```
./_delta_log/00000000000000000000.json
```

# Checkpoints
Files containing the entire state of data, unlike log files, which only contain diffs.

Types of checkpoints:
1. UUID Named Checkpoints
2. Classic Checkpoints
3. Multipart Checkpoints

The most recent checkpoint is usually:  `_delta_log/_last_checkpoint`

# Version Checksum files

To maintain the integrity of log, with each commit, delta can create a crc checksum file 

The protocol version
    The metadata of the table
    Files that have been added and not yet removed
    Files that were recently removed and have not yet expired
    Transaction identifiers
    Domain Metadata
    Checkpoint Metadata - Requires V2 checkpoints
    Sidecar File - Requires V2 checkpoints





