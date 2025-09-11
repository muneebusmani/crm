export interface Dealer {
    id: number;
    name: string;
    email: string;
    username: string;
    owner: string;
    location: string;
    logo: string;
    website: string;
    contactEmail: string;
    tierId?: number;
}
declare global {
    namespace React {
        type ReactNode = any;
    }
}
export interface QuickAction {
    title: string;
    icon: React.ReactNode;
    color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
    action: () => void;
}
export interface Highlight {
    title: string;
    value: string;
    change?: string;
    changeType?: "positive" | "negative";
    icon: React.ReactNode;
    color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}
export interface Notification {
    id: number;
    title: string;
    description: string;
    type: "warning" | "info" | "success";
    time: string;
}
export interface Task {
    id: number;
    title: string;
    dueDate: string;
    priority: "high" | "medium" | "low";
}
