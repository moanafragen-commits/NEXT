/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Activity from './pages/Activity';
import AppSettings from './pages/AppSettings';
import CharacterDevelopment from './pages/CharacterDevelopment';
import CharacterDiary from './pages/CharacterDiary';
import CharacterInfo from './pages/CharacterInfo';
import CharacterLibrary from './pages/CharacterLibrary';
import CharacterSocial from './pages/CharacterSocial';
import CharacterStatus from './pages/CharacterStatus';
import Characters from './pages/Characters';
import Chat from './pages/Chat';
import ChatView from './pages/ChatView';
import CreatePost from './pages/CreatePost';
import CreateStatus from './pages/CreateStatus';
import CreateUserStatus from './pages/CreateUserStatus';
import Diaries from './pages/Diaries';
import Feed from './pages/Feed';
import GroupChat from './pages/GroupChat';
import GroupChats from './pages/GroupChats';
import Home from './pages/Home';
import Landing from './pages/Landing';
import MemoryTraining from './pages/MemoryTraining';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import RelationshipMap from './pages/RelationshipMap';
import UserChat from './pages/UserChat';
import UserChats from './pages/UserChats';
import UserProfile from './pages/UserProfile';
import UserStatusView from './pages/UserStatusView';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "AppSettings": AppSettings,
    "CharacterDevelopment": CharacterDevelopment,
    "CharacterDiary": CharacterDiary,
    "CharacterInfo": CharacterInfo,
    "CharacterLibrary": CharacterLibrary,
    "CharacterSocial": CharacterSocial,
    "CharacterStatus": CharacterStatus,
    "Characters": Characters,
    "Chat": Chat,
    "ChatView": ChatView,
    "CreatePost": CreatePost,
    "CreateStatus": CreateStatus,
    "CreateUserStatus": CreateUserStatus,
    "Diaries": Diaries,
    "Feed": Feed,
    "GroupChat": GroupChat,
    "GroupChats": GroupChats,
    "Home": Home,
    "Landing": Landing,
    "MemoryTraining": MemoryTraining,
    "NotificationSettings": NotificationSettings,
    "Notifications": Notifications,
    "RelationshipMap": RelationshipMap,
    "UserChat": UserChat,
    "UserChats": UserChats,
    "UserProfile": UserProfile,
    "UserStatusView": UserStatusView,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};