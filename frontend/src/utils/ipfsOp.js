import { create } from "ipfs-http-client";
const ipfs = create(new URL("http://127.0.0.1:5001"));
const ipfsWebPath = "http://127.0.0.1:8080/ipfs/"

const uploadImageToIPFS = async (name, imagesObj) => {
    // Create Direcotry
    await ipfs.files.mkdir(`/RNFT/images/${name}`, { parents: true });

    for (const file of imagesObj) {
        await ipfs.files.write(
            `/RNFT/images/${name}/${name}_${file.name}`,
            file,
            {
                create: true,
            }
        );
    }

    return await ipfs.files.stat(`/RNFT/images/${name}`);
}

const readFolderContent = async (cid) => {
    let images = []
    for await (const buf of ipfs.ls(cid)) {
        images.push(ipfsWebPath + JSON.parse(JSON.stringify(buf.cid))["/"]);
    }
    return images;
}

export { uploadImageToIPFS, readFolderContent }