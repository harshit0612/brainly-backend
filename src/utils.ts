

export const random = (len: number):string => {
    let options:string = "abcdefghijklmnopqrstuvwxyz123456789";
    let optLen = options.length;
    let hash:string = "";
    for(let i=0; i<len; i++){
        hash += options[(Math.floor(Math.random()*optLen))]
    }
    return hash;
}