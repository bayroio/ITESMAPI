import { Router } from "express"
import { readdirSync } from "fs";

const PATH_ROUTER = `${__dirname }`;
const router = Router();

//Clean the filename
const cleanFileName = (filename: string) => {
    //get the filename
    const file = filename.split('.').shift();
    return file;    
}

//Get the path and filename
readdirSync(PATH_ROUTER).filter((filename) => {
    const cleanname = cleanFileName(filename);
    let name = "";
    let version = "";

    //Get the name and version
    if (cleanname != undefined){
        name = cleanname.split('_')[0];
        version = cleanname.split('_')[1];
    }   

    if ((cleanname != "Index") && (cleanname != "constants")){
        import(`./${cleanname}`).then((moduleRouter)=> {
            router.use(`/api/${version}/${name}`, moduleRouter.router);
        });
    }
})

export { router }