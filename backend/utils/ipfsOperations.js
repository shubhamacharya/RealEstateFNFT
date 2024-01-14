const crypto = require('crypto');

const ipfsWebPath = "http://127.0.0.1:8080/ipfs/"

const calculateHash = async (base64Str, algorithm = "sha256") => {
    const hash = crypto.createHash(algorithm);
    hash.update(base64Str)
    return hash.digest('hex')
}

const createIPFSNode = async () => {
  const { createHelia } =  await import('helia')
  const { tcp } = await import('@libp2p/tcp')
  const { noise } = await import('@chainsafe/libp2p-noise')
  const { MemoryBlockstore } = await import('blockstore-core')
  const { MemoryDatastore } = await import('datastore-core')
  const { createLibp2p } = await import('libp2p')
  const { yamux } = await import('@chainsafe/libp2p-yamux');
  const { unixfs, globSource } = await import('@helia/unixfs')
  const { bootstrap } = await import('@libp2p/bootstrap')
  const { CID } = await import('multiformats/cid')
  const { identifyService } = await import('libp2p/identify')
  const fs = await import('node:fs');
 

  const datastore = new MemoryDatastore()
  const blockstore = new MemoryBlockstore()
  const libp2p = await createLibp2p({
    datastore,
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
    peerDiscovery: [
      bootstrap({
        list: [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
        ]
      })
    ],
    services: {
      identify: identifyService()
    }
  })

  let node1IPFS = await createHelia({
      datastore,
      blockstore,
      libp2p
      })
  const multiaddrs = node1IPFS.libp2p.getMultiaddrs()
  console.log(multiaddrs);
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
    const { createHelia } = await import('helia')
    const { unixfs, globSource } = await import('@helia/unixfs')
    const { MemoryBlockstore } = await import('blockstore-core')
    const fs = await import('node:fs');
    const fileType = await import('file-type');
    // Create Node 
    const ipfsNode = await createHelia()
    const blockstore = new MemoryBlockstore()
    const unifs = new unixfs({ipfsNode,blockstore})
    const storageDirCID = await unifs.addDirectory()

    const newDir = await unifs.mkdir(storageDirCID, `RNFT`)
    const stat = await unifs.stat(newDir)
    console.log(stat)

    imagesObj = ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA9wMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAABAgUGB//EADkQAAICAAUCBAQFBAIBBAMAAAECAxEABBIhMUFRBRMiYTJxgZEUobHB8AYjQtHh8RUzUmKyBzSS/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAdEQEBAQEAAwEBAQAAAAAAAAAAAQIRAyExEgQT/9oADAMBAAIRAxEAPwD4wJz+H8qgUNnYUb+fNbccYyAWYa+ONTXQGMhQqDcmQN8BXavc3+WNeonS5J0iwCbrvhhGQxgXXqugpxFQuQRV8V3+WCv5a5eFI4GTMAnU+q9YPG3Tb74XAUA6gbvisMCBtCtEdJUtuauvlizKQtGmYgDi6Hb/AKwMH+3a7ng9qxouAqKvJ+MngnAEBVRJqBOpfTvVGxv9r++LKf2lcGwzFeOo/wCx98Ys76hdWLHGGsllDmsxBBHJGZJ2KhWbSFNgeonYA98BFgKqxSnmjvjckiMFPl0bO4O1YZz0H4fM5jLSkIYnrSjeYtg0fUOnNHCfN0LN8fPAFrVdRW+KI3DG7qztiekag9hhwBiEWdmtRsCcAERS4LNewtjzQsf8YjAF2EWoqo2IF7c2fvgdc2ONsa1E/wCR+Gtu3GAIANVaevFYKLIcJVVv6RsOvP7b4wSrKKHA3uz9cGEelIwAol0qwOq+b5B2B4wwGCqgGgymiSB+WDQMjS6pEPqB0Fm9IPfbcj2wSeAxwhpswArqZFRLca9hTcaTXPNUMCIqYKCyKvQm/wCXhkHKCi6FC2AfhNntv9vzwRUWPeMrKHB0hjpIFkA/Pbjtg8Xh2ZzGVzObjjLwQEebIGHp1cbc83i5MqsJVRmIpdcatcNnQSPhNgbjsLw/yXQE0KyLxHtZ2urvr1rB8yVeYyMBJsTS7Kux4H59rxawNJvEp0rZIJ9+SMMCElypUWeXAI29v4OcOZF0TUEuLU+Wt0AR89/50w/FHm8pNBLEs0DxalD2VN/5V22PHvgyZURqLBptxY5O+DshHxMaHxE7kjrQxpMoug4dBy4DwR/HrDhKe64vt7YYMLUtII/MJIB9Irvv0GLiCOGLai24Gx6Y26Ow80E+geok8Hpi5IztL5qN4WfLzo8cyPvqQ2Ntt/e/5eARQSTVauBV2vpGHc1O8jSS5iSSVyPUztqLfMn2wMBxlvMCKELaVJYGjV4fC6FHkS2ZjE8ohjEe8kyEjqRwPkMOeBRZJfFVh8SWPy3FXIxCIWApmPaj+mASySso1zB1vQFUkA0B7fLCatGjEH1gm6PfjCsHupm9GUlkgiljZkYqHQ2HANWD9MTG9UBR5Xd1mUjRQsEHmz+XBxMZVUefkl8yZ5BaAktRbcb779cABs6aYi9u+CG1OqiQ4/yHxfwjpjA00bJTbY9/bGDpRFbWNAK9RvjaJqc36i2+ptgvvvimjcEqQFIH+XNYiRs7+krYaqv2vg9NsMNOsIjXy3lMtnUCBprpVHc/TAxd0pArG1CAHWH1GtGk1t++MhYyrbtq/wAaGx7/ALYAo6kGk3XJHTFKws1teNMBYAC/IdMRvQVW1bYGwMBNWfLAT4dia6Het/kcZQgNuCQD0NdfljRdtBUKuktyB1+f1xSaCjBgQw3Ujr7YAkgslt+ebv6fPGd7rYabO+DPqKltyi0v1r5nFUpj3O44FbnDDIf+5qPxDcGucEjhTyhK0yKQwGiiWO16uKrgc4y0bBtLD1UKFje8aVCrKNxfO2AkQgE0gY3Y5AGCRHShKsb4+H9++LSLcFro8AX6uxwUI0PCANuulrtTx98OFayJPSFcPIG3Xeqbfe/t9jiCJlN3pZRx7Hth2KIvGhjRUYmzW9c8da379sHXJFCWIf00AV6YuZqLotFBJa6EtgBvZNYPHAIzRsMwHxc8X9sOQZeZ2Zq0g1YY8j5Y7HhvhMMzJUUtqNzfpv8A1XTGsyi1zvDPCZs3MkSxSWf8VW79/wA8dKXwMwIW1xqaACBiWb2/L8sd/L5MZaVXE8kDJuND7r9flhaWFFZHWQkKbK6ro4fIXa4g8Pb4Mw5y40kr/bJJPbuOOTg5yc58NzMk8sLtIyKA0dtY49V2vXjnD0ss0kheQ6jt6iOKwjmymYlMOSt20Vo7HB6hudGzaClgIx+9H/R7dcV57hHRXKqzWV9x3weN2fLOM039xOlAfzbHLzpKzEMhQsQNLEg71X63hp+ngsEmWlaWVVdQpjTTevfcdhtvZwvIsaLH5mpFkHp2vbv98B3GYMKt5ukkakO3p6g9sNiFzDJINwi62BHS+a7D8sHSvohtmGctJ5bXq3B+3z2wKhekWWrqvW+nPfBcw8Sxp/cDNZGmiAONz9/y98TLJJ5svkwiYxx63VlFhRy3/FYjVVIrOrHlUjSS0mIBYsRQ22quNsTHLz0wD362D2fUd/r74mMutZkgPhHIrre2LDKbLre/Q1t2xZbUp1Ktncaf3vFAagoHxWeTVCuMZtVMQfU3J7H9cUgLHkAd+2CRoWHqOleRewJ+fGBuOKXVQsnABFWMR6mZjKrD02ANNbEY6Hhfhb+KTw5fIapc48ulYkQ223pN3XOOUG9PwgdzhvIzCDMRNHO8DKbEgJBX3B6YCN+M+D5vwbxCbIeKxPl8xFVhvVq+3tjnCNvKdgdIBAIN/wA22+4746Xjz14rKP8AyQ8S3/8A2wzf3BX/AMt/vjnyS6oUAYKY7038RB6X2FfrgALHr3640GpgzKmxuiNvlii9FWjpGAG4O998EdZZRGzOWQ2qszXQB325HOAKQNZSOmB2NC7GCxojQs9INBHpv1NfX5CvzGBRoZHOkatX+8bX1EsdGldwKoHDgbZYVClFYHhlc9fb2/3hh4Ylc6JNcd2jadJI+XTAyzTTNIxAdhvpQKLPSht9sN5fKtqRtix7Vsdu303+3GLkZ3QeVgjcgPJpsHSTdDHoZvB4xk8jPDnY3M0ZeZFXT5bXurd/njGXymjLMqRLq1XrI69gf2x3splJXnZnjaVrskKABd9BxjWZ4z71zMtlovNBaNnI2YINxtt+2H4fCWWeszpCMP8AEajexr9MdZMlHko7RrzA9JKiwo/3gRLRtTmgR/bTv7nBdyLz47QRBlgmkZaL0gAMDyfv7YKJ083UNW3/ALTtg8js6q0sjOxUMykcngflhXMSGXKyiAK0gACgb6cZ/wClXfFwWSQsrgErfFbH6/phSSUxow1EEm6A3vjnnCmWzAnjJDepRuq+99MZlnJoaFsbbDfDl6j4MW0iZmbcAhenP74ThdcrEZjlRIzbbN+e3X5Y2kZK65nCxjetQ1H5HphObxVJojlWCwR8swtixoVX6fbFZTr2VSZirenVHRYrp4/64wvJpeVCXJBNMWJ9PTrx2wIhHaTULC7Ai6HWsFWOOf8ADQZRGknkOl0CWbJ2oddv1wyNRSGLLNlmjheaTfzLGodNvt16YXmzc2VzJjy7yxuUMcnqrUOqkdRxti4x5chgzEbpJekK4KlTv3/PAoZjBKGFUSxFxhwOOhw+p4yiQkCRpVFuVdQdNjbp0+f8K5zL6SgkcolsG45/nyO2NyTIA+oaJCVIYNTDfgDCLvULAyq2jcDqBv179Pt2xlqtsQfI+I/+LzPnLk/Ds4THoMWcy/mAcG67++JhGcBVtqd/8wQdu2JjNoBcepRopbF78jGkJST01sTQPBxkV5JurJ2Gn98aV0LKq7CqJN4kzEmdnKZeB52migZmSPohatdfOhvhWV1LFlujxqNnBHKGX+zSUSAD711+/NYG/qkelA34U2BhkhJeNQSNKAgaas9cZ9zuR0xuMDQ5sXwAf2xkMygqGGlgNVdcBtPstVTe/P8A1gfO5GCEr5moEkDcbb/XFaSFUkEg8DBCWgCSrqqr3I9VYOjnL7xu6SFWBINc7Ufp3wMSUHpVAerXTwMMSTy5kRIbZYo9EYNbDc/qTzipCtBRdZ9ZvUT6BZr/AEMMZeHzDpSpJC2lVF22/PH/AD7Ye8O8JzubcjKxSO1EnRzxZ2+WOinhkUegibWtDUTERRrcVe9d8XIi6I5fJMmlyu4NihuT2/LHo/DMrGU1yUKHpOn+d8ZyGSJrMTqpgU6Qhar2uqu+vOOvk4zKSsUeprFGhpGH+5EzF0bzAgkIcQKoqlUDccb7YMry+UYlBUSG30kgv24x0/DvBZXKlgb5O3GPQxeDwJpURO7+2Md+Z0Z8EeQgyUxVmjjBIOwN3x8sEXwuQF2mWm3JUNf3x7fMZBKLyJoAoUDhDPBIozrUEXsa/l4xu7a3mJI8rCfwsgn8oOUexG29/P8ALCXjEr5tnkjiEJZvUsa+hb6e2OpPIush0G42UHfHIzJUXblSzVYHw9698aZlZb1I4mYPl5r8OqhGOzAD4a2qucCSQRQnMEXpOn1DqR1/nTDCpDlMzFnIJpASLGigyEHm+wqxjlZqRpp2Ejq9guWWwCSfiPvzjozLHJvUrWZzDyk6ZCv+ShTVdb/XCgjzOYMkxjDqSGb1A8jg1x1++I48yX8RLIpNjzNIrTwAe3898Pw5rMR5GfLxZsplpypkj0j1gHYnsePv7YpEoUuaRpiWIdQwLOkflhlGwqxtxx98CyWZbw/NxZzw+UR5iFwUkYbh62PXFGLLloxC8lsAT5rbu/tQrcmhhWINm428vT5iiwQKAXgkk7Dkc4ZwXPZ2bN5mWWaQvmZGPmSXe554572NsJsvkoshUkdCtgfTbHSY/wDh52Gay0OZC+ko96fmCOTY2I22xyZiWMrl8uzUAEDaj13G1H9rxFqswNHEsy6hQL7Ebaiff7fc4b8T8OzeWyWX8SkyckWQzcjeQRR80gmxYNjg9Mc4ZptTayhbhP7e2r7+/Y4FNmJp4VEhd4lalS6Veuy8A4ztbSKzCyN5jRsqjYskTbcDevz464rF63g8shA+1xn8jxiYky2xYjUdIvTWCwpEczEmY8wwggMYgAxHtfXA1U6dwADwe1b4tGam217b2OPr+WEaPH8W3HPfFLwBdDrtxvjSevYMFADMo98EhUBlkQX5Z1Pqatgfv++GQUhUuaa9gAwX4tsRY2N0BS1ZBu7x0InykscSTwMqmVmlmhf1MK9I0k6eevzwksLtGrgem6tRwcPgR4QshUPelgGsVR+XONJGzFUBII+H98aRbLAJbdGuuNzffbD2UhDzf2R6VF0zUffFyJtGyP8AT2ezWp8tE7hRbGia271hrJeDuGuWObURSiqvuMeu/ov+tc5/T+SkyaZeGRJjqHmIQR0+uEs54gmfzqrO7xQPKPMMS2VBO9AYc9JvsHJq+QYS5PxExSkFWEZ4U9LHN4K6ZaTQzqWVRunQ13PNk9sLZfIwR52RIJHljDsInYabW9rGO14dl4w6PNui2Sx6e+JujzmsZLIPO9KpWPkFhW/yx7H+nvBWkZAqEV+eM+FZYSyMaXSpoFDY9iMe28HSOKqoEY59666s5/M6Z8O8MEcXrWjxhp8omnSp0/LnDJkAF30xxPFfF/LjKwENMRsOikHqcTeQp+tVjxSRI0/uyFUVdzYonpWPFT5t8xLcwJkVj5air09z0GGvFM62YoyyF2A+KqBPyvHkfEPHIbl0apCosM1hSe2NPH4u+6ny+WZ9R0c/MkEhkllADXpJ5r6Y4mc8SgfLtCWOkEsukWSR74SfMfjpJWaeGFUQUHJJc7ChXXAXdWv0q5BolyeONh8q29sdWcOHfk6DIUZpNJou/J2I7UMLSlGdR6EB3ZnXcHsQPcdO+Onkczl8rn4Z8zlEz0SWTCW0qaFiz9LrrxjhTSf3pHRQVZr0Vaj7+3GNecZS9bzixo2qN6Rj8Mi7+9DsK698DiPnVAmppS4omqqjvd0N66Hbr3znDl3ZGysLlATaySXr9yK27e+CSUpizM6LFHLvHHCaBANNQuxQP12xFaSBFJjMHjlZXRrB08HkUPvgeZMOXJVXZ2XYOAB0+XTj9sdPOZvwXMZzxGSJc4qPGv4PyEWNUYAA6l4o+3Wzjis5k9BTmh/z/BiLWkiSysyIxpkJCrquyK3631wnqWGRyrLxV1s2/Y/f6YM84pIq8tIyb8sVZI5PvsPtheRY19OpKUcLsSfc/wA5GItayMrLwzlSD6QzDqDz36jjBy6POxRUMYkC6Wsg9jfbjbfBVMFl5XlVBFqVoiGLOONVnYb9N/rhHy30OWjkIQ2WVT6T7npWIqmpppHMQdpWMUYVdTAivauMTF+TKHZIkcSKSaLAem65PXEwgEuVnlyr5mKJjl4mVZHuwhbj70cCAKuAoG/HXb3xHFlZNDAMPSb5I7YjhudQbV6ubP1wwMZmEj6K9Ro7UKHyrri6sKF+IgVVcjn/AKwuCw+E0TfBweFT5ZGjUpFvtuB+2HIKkiqrlEMmkj/IVfzGOp4Rk8rK0f4uZ4w76WOkaQvU/rgUGUMiiRqBJrdTz79Pzw7+HVNZjjdlHUryMaZyz1XU8b8F8Gy/iiZfwTxSPNZY0DM/pAPNYSAiQ+TAb6at6v32wCKGaWTyV9AYbsTsAQRX2Jx2oPD0GqRFTURVAbYpMheOCTyWUILrZQbNcjf74dykCr6SoYH1LXJHHA641lYo5laOMC0cq7axzXQc89eMdrKeHx5dbKDUP8g2+M9VpITjybM8aujxg+onTW+PTeGZNZotCDYdyReE8qWdqZSq3QZhjrHOR5GKNivmEvoCpuWP7Yw1bbx0Zzx0cnlpIWOpgqn/ABsUPl/OuOpL4zlMgvrlDP0RaJP0x4/Mz+I5iUlpVy2WG1KdTH69PkLwm/iGUyQ4aWci9IFnvZJ4wvxb8Vd5n17Obx6eXUxJgiGxU+kr31H/AFjzPi39RZePLsY3L6V3YLtY98eXz2fzvikYSYtl8mx3UHdx++14UaaKZgthVZq9RqyONzwPc1jbx/zyXunP5P6fXMmfEPE8xnYo/wD1IY4jcoWTaUni6G3XrjlZmWIkuh9YNKqt6Vv/AKGDZ6N0zsmXcR0h0kxyKy/QjY/MYUdoxrUUAABVVeOqZk+OLW+32xmp5pZ/NmkMrn1FtAWj9MYebzAoB9V2Qa9/2rbGS2olAVF96372Ti4vKjEjszRyrWkBbF9fcfng+FIkk7S6V1My6QAo30jsPa7xiWW1Jij0qOa4A4HP0wWORY4km1sZQxI9PHQb3x7VgM6x2UNv6Q24Br/XXCtVMh5Ya0dtMS0nxHmt73Pt+mBzzqRoi2RFsrpG55+vfC8shUKUYFOtAgjj2+eATTCS0gDljRDWAao/XnEWtc5O5HPtlBmFlyOWzPnIUuUEmL/5D37YDmD5SxmSNIpD6lN7nbav5eFoRqLxSkAlt7uuNthtgWcd5cwWbMGU6QDIWLdB1Pah9sZ2tZBZnV5Jna4kX1Aar3JH51gIVJ2oXHttoUktXffGWLSlVBkkfqpJbGTIxXQDSqCARV0f1xChGRmMhiPmA7+Yx0Ha9xv2/fGTGZAVhFKx9KtsWG9c/LpjLByAraSjG1cmgavi6HXGZHQIoy5dbT+5rrdvb2498Biee0aELMwDpvpA33Bon6DFYGxkXUG2AOgnT26YvCAmYzBlkPmqBIBpJVb1VQHy4GNzxJCsD/iY5HdNbBd9B6KT39sVCsYjaTQGZRpA1Eb0fV9NjXt88YOotpKKoFA7drxUJIfW51ptySqgkY6mREvk+SkxUSEhlXggjeyBfYV73tjOUy8cqKTKSwj9IoHe6o77bfPp88dzKRKMnIBDCHDFhICQzWANPuBRPF841zllrRnKeGRhI7ketNyenUw7kgdBjl5VJc1IymQ/hw5A7N8hzWH5P/JDKrHltP8AdLLqUjUR1wFTLlSpnj8s3bgD51xi9JyeXMZfL1E8OlSOVPbri5MykrBIdTIw9RXrieF5LN+M/wByLKqaIA08n6/TDEnguYykirNUSsSG31Hb9eTjOtZxjJtJlQUXSSW4C/D7Y6+UzDORZ1MOVA2OOdNGmXYxiRXNXZNbdzXTHLfN5pZl8uTSH2sjgYm56f649VJmPKcMrLYIPqYAD2xzc34w7eZ+FDzEEmxeg745U0imcNmZnbUdX909eprC5znmvekxKoquv2w545E68trrjMZ/MOXZ11suwY+lV9vfAHkyykko7uzanHJbpRPTphESmea2LhAPh6nDOW8mGMu8Zd2F6ZBe17Y0kYWqkzcsza5VeuEUmgB+2F5opHceax0OCO4wzNOqxkABuQCU2vthF8yCwu9tlpeT0xSVqqQ5WIR6CdQHWwffoMLTFgFdWsX3wGXMo7SagVDOSBW11Y359sA88AqW1UTdmqIwv0cwO76v/dYPHz/6wRlaOVl16ynpBjOobdjgMeZVRJZVwSNx/P53x08pFLOhSECuW261X+xg+i+nPZ41TYnXtenGMxFmoY0eeKRVnXUhdSAy3yO4x25/AM+EYJAwFXennHGz/wCL0LHm1kIhGlC7E6V7ViaqUjm1zOWkQZikkK3WrlSOtfznGIZoFZmkQuiqwUK5Xc3vxZ36YxHDJmJliy0fmMBdL2HOKyaZaecDNTnLwMSPNCM+nrwNzjO1tnqky+ZkgeQJIUQAk8Cuf36YH5pSLSEGlTfsfnjBkYOqqznQx09q9h79cZI9bpJ/bABIT3rYYi1fG3ljk852VC0t6QNghLA38qBH1wFqZOVAu67c4w27c8nn98URRpTY4uqwjEzM7Zid5ZFXUxshRQ+2Mx6d9YKgjZhvX5jGaogkWMaJTywFvVW4wAaCZoyNEqoCtMdFgfPbEwPLjTrY6CVHwsLB3rEwARfTSja+dgelY6CZSXSttEQ6lgbJqu/v/vDWWyET5eFYZJJs88jaoVXYAdQ177WfYDDTZhpEVYZJHgQUjEAWP2xrIyuiuXFRprBNcVtpG+33r8+b2fyErPOCDCoLKB5rEAWf074RK+URWlARelxZrat+evGDCR31OkPPqLaPT7H641lZV1sqzv5tssbkHQ8YDA7kdeOMalniQqZiHY0NbtqFdCRye+OZqzMsSQtK+lCxUKgFXzZAs79ycNrnHP4YxRQRS5X4WWAFpN7t+h379NsP6IYy+eny6q2XKIWPfURfUVQ9uMZm8TkkG+ZHmLsyru9fMYQnNzNJJoYudTeWoFb7nbj6bYtZkt0RSzDe1HH15GFw+01L4g4WIrlY10Gtx5mrb/INd1vzthMlvNXSoQMQWZgdjwdvbGoaLPM8rxrx6HOpgff9jjWcnhaTKvk1MMhQGQGPUhbuoa+33vAOsZhGTUoUBzWksx6ixQ+2BRZfMGOafypHWGtchXZOg9hZO2CxI0ZtVklKgawVPHAtqxJfOTQX2Pxi5NQ//kn34wi62rtINQIBR11y8lbur+2MLNrPqZghNFxuVxc7PJmXnnnBkYBldKUWehCih8vlhJ50mYevSAtPwDY6/wA7YfSNuViEyySFvLb06BasbrntzhKeJ1CSS+lGXzBb6dS309/9YDPO1m0KI1EAKa7179cKzTjlkXiqO+JulzIsnKOWQWdLeY/6jYjAGkdZniaYMgtNQ4I9vbbAXmaUpGAg0mgNITf3/wCcZmLI6gkMK5DWMZXTWQSKZY/jDMp6Db6Xj1f9PeOQZKSMI4opbmVOGr4RXT/ePGiSMIwYOXuw4O3tt++IrELsGvixdYJoriV958K//Ivhoy/k5nLI2obnTvjyn9WeLeG+IpI2WhrV1rjHzmSfMoqs4KArsaq6rjA2zjOKaroCxt/PnhzUK51RJqGa1CVlFfEvNe3fAJPLUBYgxYXqJ+E9qHTFmclg1qwUUFr+XgTMfN1n0t7Yi/WknGrcJVjm/fG3EiaPMAAKl0Ygbgnn8jgTS0KQdbLHk4yHG1325xJoQSaJ3rexxiCvhJ44A64IjaKaPSWU3uAfyOxxgHSoYVdb7YYa0OUazSgi7xRUCMGxuaOIUYMYyKK8741RKmRUujuQNh7YAkUbPsCK7k1isFypy3mKc4JDBvfk1qv67YmAOzl3Jhl0taKQHSyLPy7bDBZvLSNFjR2lB/8AUA9LUdqsdr5wplpGWORiAGZ6BkJLb3e36/PrhiAmeQuz+XIT6aBq/wCXzjee2F9GFjVIopIVZ3ZNMoVdrP8Ah72Bx88PxERwn8PNI0krFZITGb0c32/6w1/UPgEfgT+Hywz5uZM1lhK0k2WMVMOgvc1dn5jvjnoxzEiIhkU2RojWz7f6xUTWI9YkpYmsmhY/If8AGCT5lJ8wDJpXQojqJALoV069zivMysfh7KIG/EeZp892tFWiCpWued7w4/jS/iWlhyOQhD5fyDH5RKaK+MX/AJfn7dMHSc3VJGziOLSzGmZTv35webLz+GZtNU0XnlRIrh1cerjfej88Iu+l2RN9F6qB2I9+OuM5XMRxOJdEcixuuqN/hYc/bB0+Hc7KJjXlLG0aaXIOoOw5b2O/TAUeqonVR2IPHP7frjOdzcc51waIbYloRWld7FH61XscLNnJzAdE0hjUh9O5APN9ub++FdH+XQeSCCCKXLTz+bQDaaUatV1zuODv1+WA5zOZjNMGIEs7H1HcuWbez7n98cp5mVWaNVI0glSbocdcVHnZGey0KskdAPtqCgnmt2PGJujmKJmMyY00SRsJVuydmv5fXAg8qSaI8yodgASkho78WNjwPvhOWaVzdLQvYe9D+fXFNeltI1KDYI4/P3xF20mGmzDb2Tq6gHk++Aazr1hQLN0BsPbBV8vyibXUTY23wFyAtBjd2Vrg4jtVyLkJVvhK2Lo/rjO5UbEgnvziLvZYX7436NICbv8ALY4Omy0jE79BQHb5Y1rIoMZPVufVzjRj9Qal0tVEEV+vtjMgIchjZG1g6gPke2EGszMJWXQCFUULNk7dcCFt6QNz2xt0MYJ8xSbIAF3XfjjGfQFaxuRsb4wBYW7AAJHI/wBYtLC61u7r+fniJIVXr2u6xEXWHIoaVv1N+nvgC8wIfNJg1+VsQHILfWsCAHbfBNjGVCkyawQfbEtS7lQVXcqo/TAFBKYK6HUarEkABUBSNtxd2e+LdmYDWbFcisSOgQxdQeBYv64AzXFc++JZ7kBuLrFkgq5tbJqq6dxiMDsSRTbWPbDCSkGiAB3AxMZAZyFUWRi8AOnNzTZVEdvQhYhRxZ5OOlkpvPyzZeSOOsujujAUxNryevJxMTGkZ6Fm8Vz2bOXizOZllSCNkiVmJCL1A+f7DGYvEcxlpPw0JURTkK9qCSA3c4rExSOOf+OlikDqEJjbUtrfG/7YZUmZn1GtKGtO3GKxMSrhRZ30kCgF3rpx2xbNcEe1a3YNXWgpH/2OJiYmqgDSOrMA2w2xgzOyjUbK7L7DtiYmEqC5yEQ5XKTK7lswjM9nbnGAWOWjXUadrYdyLr9TiYmEYTORprY1vud/fElFSldyBsL+uJiYA3LO887SSVqe2NADfnAW4BPJxeJhBvKgGdFO6l6I74ys7KxZVQE9hx8sTEwBYPlKsi7m+DuMQuWKGgtijpFe2KxMAVJ6QCCbIs/XDmZy6RxMy2KWNq9zd4rEwAvKxSNUWgrgEiuosA/mcCDNuL2IrF4mAM6iSDe44IwWElvSegu+uJiYAbngjjK6FoMrEiz0bCs1RySKoFahXtisTAGtIaNTx6tOw7C7+eMWUAZSQavExMMDR6UngYoGDJbAkgE79iMXiYmAP//Z"]

    // Create Direcotry
    // await ipfs.files.mkdir(`/RNFT/images/${name}`, { parents: true });
    fileObjs = []
    imagesObj.map(async file => {
        // Calculate SHA256 hash of image
        const hash = await calculateHash(file, 'sha256');
        console.log(hash);
        const encoder = new TextEncoder()
        // Give random name to file
        const fileName = getRandomSubstring(hash, 6)
        const [, mimeType, base64Data] = file.match(/^data:(.*?);base64,(.*)$/);
        const binaryData = Buffer.from(base64Data, 'base64');
        const file_ext = "jpg"
        fileObjs.push({
          name: `${name}_${fileName}.${file_ext}`,
          content: binaryData,
        })
    });

    const fileCIDs  = await unifs.addAll(fileObjs)
    for await (const fileCID of fileCIDs){
      console.log(fileCID);
      console.log(`Image file ==> ${fileCID}`);

    }
   
}

const readFolderContent = async (cid) => {
    let images = []
    // for await (const buf of ipfs.ls(cid)) {
    //     images.push(ipfsWebPath + JSON.parse(JSON.stringify(buf.cid))["/"]);
    // }
    return images;
}

module.exports = { uploadImageToIPFS, readFolderContent }