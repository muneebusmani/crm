import AttachFileIcon from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/Send'
import { Box, CircularProgress, IconButton, TextField, Tooltip, useTheme } from '@mui/material'
import { useState } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void | Promise<void>;
  onAttach: () => void;
  disabled?: boolean;
  isSending?: boolean;
}

export default function ChatInput({
  onSend,
  onAttach,
  disabled = false,
  isSending = false,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('')
  const theme = useTheme()

  const handleSend = async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isSending) {
      try {
        await onSend(trimmedValue);
        setInputValue('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
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
      <Tooltip title="Attach file">
        <span>
          <IconButton
            onClick={onAttach}
            disabled={disabled || isSending}
            sx={{
              color: theme.palette.text.secondary,
              marginRight: 1,
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            <AttachFileIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={isSending ? 'Sending...' : 'Type a message...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled || isSending}
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              backgroundColor: theme.palette.background.paper,
              pr: 6, // Make room for the send button
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
              },
            },
          }}
        />
        {isSending && (
          <CircularProgress
            size={20}
            sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.palette.text.disabled,
            }}
          />
        )}
      </Box>

      <Tooltip title="Send message">
        <span>
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled || isSending}
            sx={{
              marginLeft: 1,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.text.disabled,
              },
              transition: 'all 0.2s ease-in-out',
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {isSending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}
