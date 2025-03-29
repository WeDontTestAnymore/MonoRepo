export enum BucketType {
    AWS = "AWS",
    Azure = "Azure",
    R2 = "R2",
    Other = "Other"
}

/**
* Maps domains for supported S3 providers
*/
export const bucketDefaults = {
    [BucketType.AWS]: {
        uri: "s3.amazonaws.com"
    },
    [BucketType.Azure]: {
        uri: "blob.core.windows.net"
    },
    [BucketType.R2]: {
        uri: "cloudflare.r2.com"
    },
    [BucketType.Other]: {
        uri: ""
    }
};

