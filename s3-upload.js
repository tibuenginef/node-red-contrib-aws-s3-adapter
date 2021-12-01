const AWS = require("aws-sdk");

const uploadToS3 = ({
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  AWS_REGION,
  S3_BUCKET,
  userId,
  base64,
  folderName,
  fileType,
}) =>
  new Promise((resolve, reject) => {
    // Configure AWS to use promise
    AWS.config.setPromisesDependency(require("bluebird"));
    AWS.config.update({
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      region: AWS_REGION,
    });

    // Create an s3 instance
    const s3 = new AWS.S3();

    // Ensure that you POST a base64 data to your server.
    // const base64Data = Buffer.from(
    //   base64.replace(/^data:image\/\w+;base64,/, ""),
    //   "base64"
    // );
    const base64Data = Buffer.from(base64);

    const params = {
      Bucket: S3_BUCKET,
      Key: `${folderName}/${userId}.${fileType}`, // type is not required
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64", // required
      ContentType: `image/${fileType}`, // required. file type, ie: jpeg, png or gif
    };

    let location = "";
    let key = "";
    try {
      s3.upload(params)
        .promise()
        .then(({ Location, Key }) => {
          location = Location;
          key = Key;
          // Save the Location (url) to the database and Key if needed.
          // As good developers, we should return the url and let other function do the saving to database etc
          console.log(location, key);

          resolve(location);
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });

module.exports = function (RED) {
  function s3FileUpload(config) {
    RED.nodes.createNode(this, config);

    var userId = this.file_data?.userId;
    var base64 = this.file_data?.base64;
    var folderName = this.file_data?.folderName;
    var fileType = this.file_data?.fileType;
    var node = this;

    node.on("input", function (msg) {
      if (
        msg.hasOwnProperty("userId") ||
        msg.hasOwnProperty("base64") ||
        msg.hasOwnProperty("fileType") ||
        msg.hasOwnProperty("folderName")
      ) {
        userId = msg.userId;
        delete msg.userId;
        base64 = msg.base64;
        delete msg.base64;
        folderName = msg.folderName;
        delete msg.folderName;
        fileType = msg.fileType;
        delete msg.fileType;
      }

      const ACCESS_KEY_ID = RED.util.evaluateNodeProperty(
        config.accessKeyId,
        config.accessKeyIdType,
        node,
        msg
      );
      const SECRET_ACCESS_KEY = RED.util.evaluateNodeProperty(
        config.secretAccessKey,
        config.secretAccessKeyType,
        node,
        msg
      );
      const AWS_REGION = RED.util.evaluateNodeProperty(
        config.awsRegion,
        config.awsRegionType,
        node,
        msg
      );
      const S3_BUCKET = RED.util.evaluateNodeProperty(
        config.s3Bucket,
        config.s3BucketType,
        node,
        msg
      );

      try {
        node.status({
          fill: "yellow",
          shape: "ring",
          text: "uploading...",
        });
        uploadToS3({
          ACCESS_KEY_ID,
          SECRET_ACCESS_KEY,
          AWS_REGION,
          S3_BUCKET,
          userId,
          base64,
          folderName,
          fileType,
        })
          .then((response) => {
            node.status({
              fill: "green",
              shape: "ring",
              text: "upload success",
            });

            msg.payload = response;
            node.send([msg, null]);
          })
          .catch((error) => {
            msg.payload = error;
            node.send([null, msg]);
            node.status({ fill: "red", shape: "ring", text: error.message });
          });
      } catch (error) {
        msg.payload = error;
        node.send([null, msg]);
        this.status({ fill: "red", shape: "ring", text: "error" });
      }
    });
  }
  RED.nodes.registerType("s3-upload", s3FileUpload, {
    file_data: {
      userId: { type: "text" },
      base64: { type: "text" },
      folderName: { type: "text" },
      fileType: { type: "text" },
    },
  });
};
