import { Bell, AlertCircle, CheckCircle, MessageCircle, Calendar } from "lucide-react";

export const NotificationIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  switch (type) {
    case "assignment":
      return <CheckCircle className={`${className} text-blue-600`} />;
    case "due-soon":
      return <Calendar className={`${className} text-orange-600`} />;
    case "mention":
      return <MessageCircle className={`${className} text-purple-600`} />;
    case "status-change":
      return <AlertCircle className={`${className} text-green-600`} />;
    default:
      return <Bell className={`${className} text-gray-600`} />;
  }
};
