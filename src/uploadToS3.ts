import axios from 'axios';
import { CallLog } from './types';

export async function uploadToS3(callLogs: CallLog[]) {
  const response = await axios.post(
    ' https://68ni5i7jre.execute-api.ap-south-1.amazonaws.com/default/SaveLogs',
    {
      body: JSON.stringify([
        ...callLogs,
        { timestamp: Date.now(), phoneNumber: '1234567890' },
      ]),
    },
  );
  console.log(response.data);
}
