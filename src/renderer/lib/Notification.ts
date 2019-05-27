import { ipc } from "./api";
import { NotificationConstructorOptions } from 'electron';
// console.log(333);
export const NotificationAble = () => ipc.emit('/Notification/Check', null);
export const NotificationFlash = () => ipc.emit('/Open/Flash', null);
export const NotificationUrl = () => ipc.emit('/Open/Url', null);

export const ShowNotification = (data: NotificationConstructorOptions) => ipc.emit('/Notification/Create', data);