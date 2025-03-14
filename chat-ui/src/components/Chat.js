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
      text: "Hi, I'm Artemis! 👋 I'm your AI assistant for FlareSense, ready to help you with a wide range of DeFi security tasks:\n\n" +
            "- **Smart Contract Analysis**: Analyze contracts for vulnerabilities, code quality issues, and gas optimization\n" +
            "- **Risk Assessment**: Evaluate security risks for contracts, protocols, and addresses\n" +
            "- **Blockchain Monitoring**: Set up monitoring for addresses, protocols, and unusual activity\n" +
            "- **Security Alerts**: Receive notifications about threats affecting your assets\n" +
            "- **Telegram Integration**: Manage your Telegram bot subscriptions and alerts\n" +
            "- **Blockchain Operations**: Generate wallets, send tokens, and execute transactions\n\n" +
            "Try asking me things like:\n" +
            "- \"Analyze this smart contract: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e\"\n" +
            "- \"What's the risk score for Uniswap protocol?\"\n" +
            "- \"Monitor this address for unusual activity: 0x28c6c06298d514db089934071355e5743bf21d60\"\n" +
            "- \"Set up Telegram alerts for whale transactions\"\n" +
            "- \"Generate a new wallet for me\"\n" +
            "- \"What are the latest DeFi security threats?\"\n\n" +
            "⚠️ While I aim to provide accurate security insights, always perform your own due diligence before interacting with any smart contract or protocol.",
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