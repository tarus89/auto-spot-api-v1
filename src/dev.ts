import { server } from "./index.js";

// start api if in dev
const PORT = process.env.PORT || 8080
server.listen(PORT, ()=> {

    console.log('====================================');
    console.log(`Auto api started on port ${PORT}`);
    console.log('====================================');
})
