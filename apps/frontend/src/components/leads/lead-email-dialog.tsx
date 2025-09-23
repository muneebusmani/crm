// "use client";
//
// import { AttachFile, Close, Email } from "@mui/icons-material";
// import {
//   Box,
//   Button,
//   Chip,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   IconButton,
//   TextField,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import { useState } from "react";
//
// interface LeadEmailDialogProps {
//   open: boolean;
//   onClose: () => void;
//   lead: {
//     id: number;
//     name: string;
//     email?: string;
//   };
//   onEmailSent: (emailData: {
//     to: string;
//     subject: string;
//     body: string;
//     cc?: string[];
//     attachments: File[];
//   }) => void;
// }
//
// const LeadEmailDialog: React.FC<LeadEmailDialogProps> = ({
//   open,
//   onClose,
//   lead,
//   onEmailSent,
// }) => {
//   const theme = useTheme();
//   const [subject, setSubject] = useState("");
//   const [body, setBody] = useState("");
//   const [ccEmails, setCcEmails] = useState<string[]>([]);
//   const [inputCcEmail, setInputCcEmail] = useState("");
//   const [attachments, setAttachments] = useState<File[]>([]);
//   const [isSending, setIsSending] = useState(false);
//
//   const handleSend = () => {
//     setIsSending(true);
//     onEmailSent({
//       to: lead.email || "",
//       subject,
//       body,
//       cc: ccEmails,
//       attachments,
//     });
//
//     // Simulate sending delay
//     setTimeout(() => {
//       setIsSending(false);
//       setSubject("");
//       setBody("");
//       setCcEmails([]);
//       setAttachments([]);
//       onClose();
//     }, 2000);
//   };
//
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files);
//       setAttachments((prev) => [...prev, ...filesArray]);
//     }
//   };
//
//   const removeAttachment = (index: number) => {
//     setAttachments((prev) => prev.filter((_, i) => i !== index));
//   };
//
//   const handleCcKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       if (inputCcEmail.trim() && !ccEmails.includes(inputCcEmail.trim())) {
//         setCcEmails([...ccEmails, inputCcEmail.trim()]);
//         setInputCcEmail("");
//       }
//     }
//   };
//
//   const removeCcEmail = (emailToRemove: string) => {
//     setCcEmails(ccEmails.filter((email) => email !== emailToRemove));
//   };
//
//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle>
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Email color="primary" />
//             <Typography variant="h6">Send Email to {lead.name}</Typography>
//           </Box>
//           <IconButton onClick={onClose} size="small">
//             <Close />
//           </IconButton>
//         </Box>
//       </DialogTitle>
//
//       <Divider />
//
//       <DialogContent>
//         <Box sx={{ py: 2 }}>
//           <Typography variant="subtitle1" gutterBottom>
//             To:{" "}
//             <strong>
//               {lead.name}{" "}
//               {lead.email ? `(${lead.email})` : "(No email provided)"}
//             </strong>
//           </Typography>
//
//           <TextField
//             fullWidth
//             label="Subject"
//             variant="outlined"
//             value={subject}
//             onChange={(e) => setSubject(e.target.value)}
//             sx={{ mb: 2 }}
//           />
//
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>
//               CC:
//             </Typography>
//             <TextField
//               fullWidth
//               variant="outlined"
//               value={inputCcEmail}
//               onChange={(e) => setInputCcEmail(e.target.value)}
//               onKeyDown={handleCcKeyDown}
//               placeholder="Add CC email addresses (press Enter or comma to add)"
//               size="small"
//             />
//
//             {ccEmails.length > 0 && (
//               <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
//                 {ccEmails.map((email) => (
//                   <Chip
//                     key={email}
//                     label={email}
//                     onDelete={() => removeCcEmail(email)}
//                     size="small"
//                     color="primary"
//                   />
//                 ))}
//               </Box>
//             )}
//           </Box>
//
//           <TextField
//             multiline
//             rows={8}
//             fullWidth
//             label="Message Body"
//             variant="outlined"
//             value={body}
//             onChange={(e) => setBody(e.target.value)}
//             placeholder={`Dear ${lead.name},\n\nI hope this email finds you well.\n\nBest regards,\nYour Name`}
//             sx={{ mb: 2 }}
//           />
//
//           {attachments.length > 0 && (
//             <Box sx={{ mb: 2 }}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Attachments:
//               </Typography>
//               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                 {attachments.map((file, index) => (
//                   <Chip
//                     key={file.name}
//                     label={file.name}
//                     onDelete={() => removeAttachment(index)}
//                     size="small"
//                     color="primary"
//                   />
//                 ))}
//               </Box>
//             </Box>
//           )}
//
//           <Button
//             variant="outlined"
//             component="label"
//             startIcon={<AttachFile />}
//             sx={{ mb: 2 }}
//           >
//             Attach File
//             <input type="file" hidden multiple onChange={handleFileChange} />
//           </Button>
//
//           <Box
//             sx={{
//               p: 2,
//               backgroundColor: theme.palette.grey[50],
//               borderRadius: 1,
//               border: `1px solid ${theme.palette.divider}`,
//             }}
//           >
//             <Typography variant="body2" color="text.secondary">
//               <strong>Email Preview:</strong>
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Subject: {subject || "No subject"}
//             </Typography>
//             {ccEmails.length > 0 && (
//               <Typography variant="body2" color="text.secondary">
//                 CC: {ccEmails.join(", ")}
//               </Typography>
//             )}
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//               {body
//                 ? body.substring(0, 100) + (body.length > 100 ? "..." : "")
//                 : "No message content"}
//             </Typography>
//             {attachments.length > 0 && (
//               <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                 Attachments: {attachments.length} file(s)
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       </DialogContent>
//
//       <DialogActions sx={{ p: 2 }}>
//         <Button onClick={onClose} variant="outlined" color="secondary">
//           Cancel
//         </Button>
//
//         <Button
//           onClick={handleSend}
//           variant="contained"
//           disabled={!subject.trim() || !body.trim() || isSending || !lead.email}
//           startIcon={<Email />}
//           sx={{
//             backgroundColor: theme.palette.primary.main,
//             "&:hover": { backgroundColor: theme.palette.primary.dark },
//           }}
//         >
//           {isSending ? "Sending..." : "Send Email"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
//
// export default LeadEmailDialog;
"use client";

import { AttachFile, Close, Email } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";

interface LeadEmailDialogProps {
  open: boolean;
  onClose: () => void;
  lead: {
    id: number;
    name: string;
    email?: string;
  };
  onEmailSent: (emailData: {
    to: string;
    subject: string;
    body: string;
    cc?: string[];
    attachments: File[];
  }) => void;
}

const LeadEmailDialog: React.FC<LeadEmailDialogProps> = ({
  open,
  onClose,
  lead,
  onEmailSent,
}) => {
  const theme = useTheme();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [inputCcEmail, setInputCcEmail] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!lead.email) return;

    setIsSending(true);
    onEmailSent({
      to: lead.email,
      subject,
      body,
      cc: ccEmails,
      attachments,
    });

    // Simulate sending delay
    setTimeout(() => {
      setIsSending(false);
      setSubject("");
      setBody("");
      setCcEmails([]);
      setAttachments([]);
      onClose();
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCcKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputCcEmail.trim() && !ccEmails.includes(inputCcEmail.trim())) {
        setCcEmails([...ccEmails, inputCcEmail.trim()]);
        setInputCcEmail("");
      }
    }
  };

  const removeCcEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter((email) => email !== emailToRemove));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Email color="primary" />
            <Typography variant="h6">Send Email to {lead.name}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            To:{" "}
            <strong>
              {lead.name}{" "}
              {lead.email ? `(${lead.email})` : "(No email provided)"}
            </strong>
          </Typography>

          <TextField
            fullWidth
            label="Subject"
            variant="outlined"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              CC:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={inputCcEmail}
              onChange={(e) => setInputCcEmail(e.target.value)}
              onKeyDown={handleCcKeyDown}
              placeholder="Add CC email addresses (press Enter or comma to add)"
              size="small"
            />

            {ccEmails.length > 0 && (
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {ccEmails.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => removeCcEmail(email)}
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
            )}
          </Box>

          <TextField
            multiline
            rows={8}
            fullWidth
            label="Message Body"
            variant="outlined"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Dear ${lead.name},\n\nI hope this email finds you well.\n\nBest regards,\nYour Name`}
            sx={{ mb: 2 }}
          />

          {attachments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={file.name}
                    label={file.name}
                    onDelete={() => removeAttachment(index)}
                    size="small"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFile />}
            sx={{ mb: 2 }}
          >
            Attach File
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>

          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[50],
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>Email Preview:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subject: {subject || "No subject"}
            </Typography>
            {ccEmails.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                CC: {ccEmails.join(", ")}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {body
                ? body.substring(0, 100) + (body.length > 100 ? "..." : "")
                : "No message content"}
            </Typography>
            {attachments.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Attachments: {attachments.length} file(s)
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>

        <Button
          onClick={handleSend}
          variant="contained"
          disabled={!subject.trim() || !body.trim() || isSending || !lead.email}
          startIcon={<Email />}
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          }}
        >
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeadEmailDialog;
