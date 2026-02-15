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
import CharacterDevelopment from './pages/CharacterDevelopment';
import CharacterInfo from './pages/CharacterInfo';
import CharacterLibrary from './pages/CharacterLibrary';
import CharacterStatus from './pages/CharacterStatus';
import Characters from './pages/Characters';
import Chat from './pages/Chat';
import ChatView from './pages/ChatView';
import CreateStatus from './pages/CreateStatus';
import CreateUserStatus from './pages/CreateUserStatus';
import Feed from './pages/Feed';
import GroupChat from './pages/GroupChat';
import GroupChats from './pages/GroupChats';
import Landing from './pages/Landing';
import NotificationSettings from './pages/NotificationSettings';
import UserChat from './pages/UserChat';
import UserChats from './pages/UserChats';
import UserProfile from './pages/UserProfile';
import UserStatusView from './pages/UserStatusView';
import MemoryTraining from './pages/MemoryTraining';
import Activity from './pages/Activity';
import CreatePost from './pages/CreatePost';
import AppSettings from './pages/AppSettings';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CharacterDevelopment": CharacterDevelopment,
    "CharacterInfo": CharacterInfo,
    "CharacterLibrary": CharacterLibrary,
    "CharacterStatus": CharacterStatus,
    "Characters": Characters,
    "Chat": Chat,
    "ChatView": ChatView,
    "CreateStatus": CreateStatus,
    "CreateUserStatus": CreateUserStatus,
    "Feed": Feed,
    "GroupChat": GroupChat,
    "GroupChats": GroupChats,
    "Landing": Landing,
    "NotificationSettings": NotificationSettings,
    "UserChat": UserChat,
    "UserChats": UserChats,
    "UserProfile": UserProfile,
    "UserStatusView": UserStatusView,
    "MemoryTraining": MemoryTraining,
    "Activity": Activity,
    "CreatePost": CreatePost,
    "AppSettings": AppSettings,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};