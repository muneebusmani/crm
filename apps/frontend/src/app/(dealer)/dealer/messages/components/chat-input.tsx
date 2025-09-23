import AttachFileIcon from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/Send'
import { Box, IconButton, TextField, useTheme } from '@mui/material'
import { useState } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  onAttach: () => void // New callback
  disabled?: boolean
}

export default function ChatInput({
  onSend,
  onAttach,
  disabled = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const theme = useTheme()

  const handleSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1.5),
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <IconButton
        onClick={onAttach}
        disabled={disabled}
        sx={{
          color: theme.palette.text.secondary,
          marginRight: 1,
        }}
      >
        <AttachFileIcon />
      </IconButton>

      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Type a message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 20,
            backgroundColor: theme.palette.grey[50],
          },
        }}
      />

      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!inputValue.trim() || disabled}
        sx={{
          backgroundColor: inputValue.trim()
            ? theme.palette.primary.main
            : theme.palette.grey[200],
          color: theme.palette.common.white,
          '&:hover': {
            backgroundColor: inputValue.trim()
              ? theme.palette.primary.dark
              : theme.palette.grey[300],
          },
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  )
}
