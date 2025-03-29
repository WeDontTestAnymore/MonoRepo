import { S3Client } from "@aws-sdk/client-s3"

//config contains bucket access details

export const s3setup = (config)=>{
    //console.log(config)
    const {endpoint,region,credentials,forcePathStyle} = config
    const s3 = new S3Client({
        endpoint:endpoint,
        region:region,
        credentials: credentials,
        forcePathStyle:true || null
    })
    return s3;
}