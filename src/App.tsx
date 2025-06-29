import { useState } from 'react'
import axios from 'axios';
import './App.css';

interface Chunk{
  policy:string;
  text: string;
}
interface ConversationTurn{
  question: string;
  answer: string;
  chunks: Chunk[];
}
function App() {
  const [question,setQuestion] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number | null>(null);
  // const [answer, setAnswer] = useState<string>('');
  // const[matchedChunks,setMatchedChunks] = useState<Chunk[]>([])
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const req_time = Date.now();
      console.log(req_time);
      const res = await axios.post('http://localhost:8000/query',{question});
      console.log('response received; time elapsed: ');
      console.log(Date.now()-req_time);

      const newTurn: ConversationTurn = {
        question,
        answer: res.data.gpt_answer,
        chunks: res.data.matched_chunks || [],
      }
      console.log("Chunks returned:", res.data.matched_chunks);
      setConversation (prev => [...prev,newTurn]);
      setSelectedTurnIndex(conversation.length);
      setQuestion('');

    } catch (err: any){
      console.error(err);
      // setAnswer("Error: "+(err.response?.data?.detail || "Something went wrong"));
      // setMatchedChunks([]);
    }finally{
      setLoading(false);
    }
  }
  return (
    <div className="app">
      <h1> Insurance Assistant</h1>
      <form onSubmit={handleSubmit}>
        <input
        type="text"
        value={question}
        onChange={ (e) => setQuestion(e.target.value)}
        placeholder="Ask about a policy..."
        />
        <button type="submit">Ask</button>
    </form>
    {loading && (
      <div className="spinner-container">
        <div className="spinner" />
        <p>Getting your answer...</p>
      </div>
  )}
  <div className="results">
    <div className="conversation">
      {conversation.map((turn,idx)=>(
        <div key ={idx} className={`turn ${selectedTurnIndex === idx? 'active': ''}`} 
        onClick={()=>setSelectedTurnIndex(idx)}
        >
      <div className="bubble user">{turn.question}</div>
      <div className="bubble assisttant">{turn.answer}</div>
      </div>
      ))}
    </div>
    {selectedTurnIndex !== null && conversation[selectedTurnIndex].chunks.length>0 &&(
      <div className="chunk-column fade-in">
        <h3> Matched Policy Sections</h3>
        <ul>
          {conversation[selectedTurnIndex].chunks.map((chunk,idx)=>(
            <li key={idx}>
              <strong> {chunk.policy}: </strong>
              <pre style={{ whiteSpace: 'pre-wrap'}}>{chunk.text}</pre>
            </li>
          ))}
        </ul>
        </div>
    )}
    </div>
    </div>
  )
}

export default App
