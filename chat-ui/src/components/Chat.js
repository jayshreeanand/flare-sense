import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Paper,
  TextField,
  Button,
} from '@mui/material';

function Chat() {
  const [messages, setMessages] = useState([
    {
      text: "Hi, I'm Artemis! 👋 I'm your Copilot for Flare, ready to help you with operations like generating wallets, sending tokens, and executing token swaps. \n\n⚠️ While I aim to be accurate, never risk funds you can't afford to lose.",
      type: 'bot'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text) => {
    try {
      const response = await fetch('/api/routes/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error:', error);
      return 'Sorry, there was an error processing your request. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setMessages(prev => [...prev, { text: messageText, type: 'user' }]);

    const response = await handleSendMessage(messageText);
    setMessages(prev => [...prev, { text: response, type: 'bot' }]);
    setIsLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                color: message.type === 'user' ? 'white' : 'text.primary'
              }}
            >
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            variant="outlined"
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{ minWidth: 100 }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default Chat; 