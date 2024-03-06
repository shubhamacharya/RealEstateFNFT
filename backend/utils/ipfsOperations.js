const crypto = require('crypto');

const ipfsWebPath = "http://127.0.0.1:8080/ipfs/";
const peerIds = ["/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWGPFDfXyGJrxcmi65WagVDdydYe5AkK2tsXVWY2PJ2QJ7"];

const calculateHash = async (base64Str, algorithm = "sha256") => {
  const hash = crypto.createHash(algorithm);
  hash.update(base64Str);
  return hash.digest('hex');
}

const createIPFSNode = async () => {
  const { createHelia } = await import('helia')
  const { tcp } = await import('@libp2p/tcp')
  const { noise } = await import('@chainsafe/libp2p-noise')
  const { FsBlockstore } = await import('blockstore-fs')
  const { LevelDatastore } = await import('datastore-level')
  const { createLibp2p } = await import('libp2p')
  const { yamux } = await import('@chainsafe/libp2p-yamux');
  const { identifyService } = await import('libp2p/identify')
  const fs = await import('node:fs');


  const datastore = new LevelDatastore('../ipfsData/data')
  const blockstore = new FsBlockstore('../ipfsData/data')

  const libp2p = await createLibp2p({
    datastore,
    blockstore,
    addresses: {
      listen: [
        '/ip4/127.0.0.1/tcp/0'
      ]
    },
    transports: [
      tcp()
    ],
    connectionEncryption: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    services: {
      identify: identifyService()
    }
  })

  return await createHelia({
    datastore,
    blockstore,
    libp2p
  })

}

const connectNode = async (ipfsNode, peerIds) => {
  const { multiaddr } = await import('multiaddr');
  peerIds.forEach(peerId => {
    ipfsNode.libp2p.dial(multiaddr(peerId));
  });
}

const handleFolderDoesNotExistError = async (mutableFS, path) => {
  try {
    const stat = await mutableFS.stat(path);
    console.log(stat.cid);
  } catch (error) {
    if (error.code === 'ERR_DOES_NOT_EXIST') {
      console.log(`Folder '${path}' does not exist. Creating new folder...`);
      const newDir = await mutableFS.mkdir(path);
      console.log('Folder ==> ', newDir);
    } else {
      throw error;
    }
  }
}

const uploadImageToIPFS = async (path = '/RNFT', name, imagesObj) => {
  const { mfs } = await import('@helia/mfs');

  const ipfsNode = await createIPFSNode();
  ipfsNode.libp2p.start();

  const mutableFS = new mfs(ipfsNode);

  await handleFolderDoesNotExistError(mutableFS, path);

  // Create Direcotry
  for (const file of imagesObj) {
    const hash = await calculateHash(file, 'sha256');
    const fileName = hash.substring(hash.length - 6, hash.length);
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const file_ext = "jpg";

    try {
      await mutableFS.writeByteStream(buffer, `/RNFT/${name}_${fileName}.${file_ext}`, { leafType: 'file' });
    } catch (error) {
      if (error.code === 'ERR_ALREADY_EXISTS') {
        console.log('File already added....');
      }
    }
  }

  const stat = await mutableFS.stat('/RNFT');
  if (!await ipfsNode.pins.isPinned(stat.cid)) {
    const res = await ipfsNode.pins.add(stat.cid);
    console.log("Res ==> ", res);
  }

  ipfsNode.libp2p.stop();
}

const readFolderContent = async (peerIds, path = '/RNFT') => {
  const { mfs } = await import('@helia/mfs');
  const filterKeys = ["name", "path", "cid", "node"];
  let images = [];

  const ipfsNode = await createIPFSNode();
  await connectNode(ipfsNode, peerIds);
  const mutableFS = new mfs(ipfsNode);

  for await (const entries of mutableFS.ls(path)) {
    const filterObj = {};
    filterKeys.forEach(key => {
      if (entries.hasOwnProperty(key)) {
        filterObj[key] = entries[key];
      }
    });
    images.push(filterObj);
  }

  ipfsNode.stop();
  return images;
}

const pinContent = async (CIDs) => {
  const ipfsNode = await createIPFSNode();
  await connectNode(ipfsNode, peerIds);
  CIDs.forEach(async cid => {
    await ipfsNode.pins.add(cid);
  });
}

const unpinContent = async (CIDs) => {
  const ipfsNode = await createIPFSNode();
  await connectNode(ipfsNode, peerIds);
  CIDs.forEach(async cid => {
    await ipfsNode.pins.rm(cid);
  });
}

// Example usage
readFolderContent(peerIds).then(imgs => {
  // console.log(imgs);
  let cids = imgs.map(img => img.path.toString());
  console.log(cids);
  // unpinContent(cids);
})


module.exports = { uploadImageToIPFS, readFolderContent, unpinContent, pinContent };