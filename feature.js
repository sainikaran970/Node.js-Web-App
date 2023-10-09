// Its a file based module

const gfName = "MrsRandom"
const gfName2 = "MrsRandom2"
// (Another way to export)export const gfName2 = "MrsRandom2"
const gfName3 = "MrsRandom3"



export const generatepercent = () =>{
    return `${Math.floor(Math.random() * 100)}%`
}

export default gfName
export {gfName2 , gfName3}     // <- Multiple Exports

