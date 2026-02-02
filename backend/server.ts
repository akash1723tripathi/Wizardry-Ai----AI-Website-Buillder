import express ,{Request,Response} from 'express';
import 'dotenv/config';
import cors from 'cors';


const app = express();
const PORT = 3000;

const corsOptions = {
      origin : process.env.TRUSTED_ORIGINS?.split(',') || [],
      credentials : true,
}
app.use(cors(corsOptions));

app.get('/',(req:Request,res:Response)=>{
      res.send('Server is Live!');
})

app.listen(PORT,()=>{
      console.log(`Server is running on http://localhost:${PORT}`);
})