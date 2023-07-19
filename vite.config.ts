import { defineConfig, UserConfigExport } from 'vite'

export default defineConfig(({ command }) => {

    const configExport : UserConfigExport = {
    }
    if(command === "serve"){
        configExport.server = {
            host : true,
        }
    }
    return configExport;
});