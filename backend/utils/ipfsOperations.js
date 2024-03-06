const crypto = require('crypto');

const ipfsWebPath = "http://127.0.0.1:8080/ipfs/"

const calculateHash = async (base64Str, algorithm = "sha256") => {
  const hash = crypto.createHash(algorithm);
  hash.update(base64Str)
  return hash.digest('hex')
}

const createIPFSNode = async () => {
  const { createHelia } = await import('helia')
  const { tcp } = await import('@libp2p/tcp')
  const { noise } = await import('@chainsafe/libp2p-noise')
  const { FsBlockstore } = await import('blockstore-fs')
  const { LevelDatastore } = await import('datastore-level')
  const { createLibp2p } = await import('libp2p')
  const { yamux } = await import('@chainsafe/libp2p-yamux');
  const { unixfs, globSource } = await import('@helia/unixfs')
  const { bootstrap } = await import('@libp2p/bootstrap')
  const { CID } = await import('multiformats/cid')
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

const getRandomSubstring = (inputString, length) => {
  if (length <= 0 || length > inputString.length) {
    console.error("Invalid length parameter");
    return null;
  }

  const startIndex = Math.floor(Math.random() * (inputString.length - length + 1));
  const randomSubstring = inputString.substr(startIndex, length);

  return randomSubstring;
}

const uploadImageToIPFS = async (name, imagesObj) => {
  const { mfs } = await import('@helia/mfs')
  const fs = await import('node:fs');
  const { multiaddr } = await import('multiaddr')

  // Create Node 
  const ipfsNode = await createIPFSNode()
  ipfsNode.libp2p.start()
  ipfsNode.libp2p.dial(multiaddr("/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWGPFDfXyGJrxcmi65WagVDdydYe5AkK2tsXVWY2PJ2QJ7"))
  const multiaddrs = ipfsNode.libp2p.getMultiaddrs()
  console.log(multiaddrs);

  const mutableFS = new mfs(ipfsNode)

  // console.log(mutableFS);

  // const newDir = await mutableFS.mkdir('/RNFT')
  // console.log(newDir)
  const stat = await mutableFS.stat('/RNFT')

  // Create Direcotry
  fileObjs = ['data:image/jpeg;base64,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']
  fileObjs.map(async file => {
    // Calculate SHA256 hash of image
    const hash = await calculateHash(file, 'sha256');

    const encoder = new TextEncoder()
    // Give random name to file
    const fileName = getRandomSubstring(hash, 6)
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    // Create a Buffer from the base64 string
    const buffer = Buffer.from(base64Data, 'base64');

    // Write the Buffer to a file
    // fs.writeFileSync(outputPath, buffer, 'binary');
    const file_ext = "jpg"
    // fs.createWriteStream()
    await mutableFS.writeByteStream(buffer, `/RNFT/${name}_${fileName}.${file_ext}`, {leafType: 'file'})
  });

  for await (const entry of mutableFS.ls('/RNFT')) {
    console.info(entry)
  }

  ipfsNode.libp2p.stop()

}

const readFolderContent = async (cid) => {
  let images = []
  // for await (const buf of ipfs.ls(cid)) {
  //     images.push(ipfsWebPath + JSON.parse(JSON.stringify(buf.cid))["/"]);
  // }
  return images;
}

uploadImageToIPFS('test', [])
module.exports = { uploadImageToIPFS, readFolderContent }