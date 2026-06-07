import sys
import subprocess
import webbrowser
import pyautogui
import os
import urllib.parse
import time
from datetime import datetime

ACTION = sys.argv[1].lower().strip() if len(sys.argv) > 1 else ""
TARGET = sys.argv[2].lower().strip() if len(sys.argv) > 2 else ""
USER_CODE = sys.argv[3].strip() if len(sys.argv) > 3 else ""

SECURITY_CODE = os.getenv("SECURITY_CODE", "")

DANGEROUS_ACTIONS = [
    "shutdown",
    "sleep",
    "lock",
    "restart",
    "delete_file",
    "delete_folder"
]

APP_ALIASES = {
    "chrome": "chrome.exe",
    "google chrome": "chrome.exe",
    "browser": "chrome.exe",

    "edge": "msedge.exe",
    "firefox": "firefox.exe",
    "brave": "brave.exe",

    "notepad": "notepad.exe",
    "notes": "notepad.exe",

    "calculator": "calc.exe",
    "calc": "calc.exe",

    "camera": "microsoft.windows.camera:",
    "photos": "ms-photos:",
    "gallery": "ms-photos:",

    "settings": "ms-settings:",
    "control panel": "control.exe",
    "task manager": "taskmgr.exe",

    "terminal": "wt.exe",
    "cmd": "cmd.exe",
    "command prompt": "cmd.exe",
    "powershell": "powershell.exe",

    "vscode": "code",
    "vs code": "code",
    "visual studio code": "code",

    "spotify": "spotify:",
    "whatsapp": "whatsapp:",
    "telegram": "telegram:",
    "discord": "discord:",
    "steam": "steam:",

    "file explorer": "explorer.exe",
    "explorer": "explorer.exe",
    "files": "explorer.exe",

    "downloads": "shell:Downloads",
    "downloads folder": "shell:Downloads",
    "documents": "shell:Documents",
    "documents folder": "shell:Documents",
    "desktop": "shell:Desktop",
    "recycle bin": "shell:RecycleBinFolder",

    "youtube": "https://youtube.com",
    "youtube music": "https://music.youtube.com",
    "google": "https://google.com",
    "github": "https://github.com",
    "gmail": "https://mail.google.com",
    "chatgpt": "https://chatgpt.com",
}

PROCESS_NAMES = {
    "chrome": "chrome.exe",
    "google chrome": "chrome.exe",
    "browser": "chrome.exe",

    "edge": "msedge.exe",
    "firefox": "firefox.exe",
    "brave": "brave.exe",

    "notepad": "notepad.exe",
    "calculator": "CalculatorApp.exe",
    "calc": "CalculatorApp.exe",

    "vscode": "Code.exe",
    "vs code": "Code.exe",
    "visual studio code": "Code.exe",

    "terminal": "WindowsTerminal.exe",
    "cmd": "cmd.exe",
    "command prompt": "cmd.exe",
    "powershell": "powershell.exe",

    "spotify": "Spotify.exe",
    "whatsapp": "WhatsApp.exe",
    "telegram": "Telegram.exe",
    "discord": "Discord.exe",
    "steam": "steam.exe",

    "file explorer": "explorer.exe",
    "explorer": "explorer.exe",
    "files": "explorer.exe",

    "camera": "WindowsCamera.exe",
    "task manager": "Taskmgr.exe",
}

def normalize_target(target):
    target = target.lower().strip()

    remove_words = [
        "open",
        "close",
        "launch",
        "start",
        "run",
        "the",
        "please",
        "can you",
        "could you",
        "for me",
        "aditi",
        "hey"
    ]

    for word in remove_words:
        target = target.replace(word, "")

    return target.strip()

def require_code():
    if not SECURITY_CODE:
        print("SECURITY_CODE is not set in environment.")
        return False

    if USER_CODE != SECURITY_CODE:
        print("Security code required or incorrect.")
        return False

    return True
def open_app(target):
    target = normalize_target(target)

    for name, command in APP_ALIASES.items():
        if name in target or target in name:
            if command.startswith("http"):
                webbrowser.open(command)

            elif command.endswith(":"):
                subprocess.Popen(f'start "" "{command}"', shell=True)

            elif command.startswith("shell:"):
                subprocess.Popen(f'explorer "{command}"', shell=True)

            else:
                subprocess.Popen(command, shell=True)

            print(f"Opened {name}")
            return

    print("App not recognized or not allowed.")

def close_app(target):
    target = normalize_target(target)

    for name, process in PROCESS_NAMES.items():
        if name in target or target in name:
            subprocess.run(
    f'taskkill /f /im "{process}"',
    shell=True,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL
)

            if process.lower() == "explorer.exe":
                time.sleep(1)
                subprocess.Popen("explorer.exe", shell=True)
                print("Restarted File Explorer")

            print(f"Closed {name}")
            return

    print("App not recognized or not allowed to close.")

def open_website(target):
    target = normalize_target(target)

    if not target:
        print("No website provided.")
        return

    if not target.startswith("http"):
        if "." not in target:
            target = f"https://www.{target}.com"
        else:
            target = "https://" + target

    webbrowser.open(target)
    print(f"Opened website {target}")

def clean_search_query(target):
    target = target.lower().strip()

    remove_phrases = [
        "search google for",
        "google search",
        "search for",
        "search",
        "look up",
        "find",
        "on google",
        "google",
        "please",
        "aditi",
        "hey"
    ]

    for phrase in remove_phrases:
        target = target.replace(phrase, "")

    return target.strip()

def clean_youtube_query(target):
    target = target.lower().strip()

    remove_phrases = [
        "play",
        "search youtube for",
        "search on youtube",
        "youtube search",
        "search youtube",
        "on youtube",
        "youtube",
        "first video",
        "first result",
        "open",
        "and",
        "please",
        "aditi",
        "hey"
    ]

    for phrase in remove_phrases:
        target = target.replace(phrase, "")

    return target.strip()

def search_google(target):
    query = clean_search_query(target)

    if not query:
        print("No Google search query provided.")
        return

    encoded = urllib.parse.quote(query)
    webbrowser.open(f"https://www.google.com/search?q={encoded}")
    print(f"Searched Google for {query}")

def search_youtube(target, autoplay=False):
    query = clean_youtube_query(target)

    if not query:
        print("No YouTube search query provided.")
        return

    encoded = urllib.parse.quote(query)
    webbrowser.open(f"https://www.youtube.com/results?search_query={encoded}")
    print(f"Searched YouTube for {query}")

    if autoplay:
        time.sleep(5)
        pyautogui.press("tab", presses=5, interval=0.1)
        pyautogui.press("enter")
        print(f"Tried playing first YouTube result for {query}")
    

def take_screenshot():
    folder = os.path.join(os.getcwd(), "captures")
    os.makedirs(folder, exist_ok=True)

    filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    path = os.path.join(folder, filename)

    screenshot = pyautogui.screenshot()
    screenshot.save(path)

    print(f"Screenshot saved: {path}")

def take_photo():
    try:
        import cv2

        folder = os.path.join(os.getcwd(), "captures")
        os.makedirs(folder, exist_ok=True)

        filename = f"photo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        path = os.path.join(folder, filename)

        cam = cv2.VideoCapture(0)
        ret, frame = cam.read()
        cam.release()

        if ret:
            cv2.imwrite(path, frame)
            print(f"Photo saved: {path}")
        else:
            print("Camera could not capture photo.")

    except ImportError:
        print("OpenCV not installed. Run: pip install opencv-python")

def system_control(action):
    if action == "shutdown":
        if require_code():
            subprocess.run("shutdown /s /t 5", shell=True)
            print("Shutting down system.")

    elif action == "restart":
        if require_code():
            subprocess.run("shutdown /r /t 5", shell=True)
            print("Restarting system.")

    elif action == "lock":
        subprocess.run("rundll32.exe user32.dll,LockWorkStation", shell=True)
        print("System locked.")

def delete_path(target):
    if not require_code():
        return

    if not target:
        print("No path provided.")
        return

    path = os.path.abspath(target)

    protected = [
        os.path.abspath("C:\\"),
        os.path.expanduser("~"),
        os.path.abspath(os.getcwd()),
    ]

    if path in protected:
        print("Refusing to delete protected path.")
        return

    if os.path.isfile(path):
        os.remove(path)
        print(f"Deleted file: {path}")

    elif os.path.isdir(path):
        print("Folder deletion blocked for safety. Use manual deletion.")

    else:
        print("Path not found.")

if ACTION in DANGEROUS_ACTIONS and USER_CODE != SECURITY_CODE:
    print("Dangerous action blocked. Correct security code required.")
    sys.exit()

if ACTION == "open_app":
    open_app(TARGET)

elif ACTION == "close_app":
    close_app(TARGET)

elif ACTION == "close_tab":
    pyautogui.hotkey("ctrl", "w")
    print("Closed current tab")

elif ACTION == "close_window":
    pyautogui.hotkey("alt", "f4")
    print("Closed current window")

elif ACTION == "new_tab":
    pyautogui.hotkey("ctrl", "t")
    print("Opened new tab")

elif ACTION == "next_tab":
    pyautogui.hotkey("ctrl", "tab")
    print("Switched to next tab")

elif ACTION == "previous_tab":
    pyautogui.hotkey("ctrl", "shift", "tab")
    print("Switched to previous tab")

elif ACTION == "open_website":
    open_website(TARGET)

elif ACTION == "search_google" or ACTION == "google_search":
    search_google(TARGET)

elif ACTION == "search_youtube" or ACTION == "youtube_search":
    search_youtube(TARGET, autoplay=False)

elif ACTION == "play_youtube":
    search_youtube(TARGET, autoplay=True)

elif ACTION == "screenshot" or ACTION == "take_screenshot":
    take_screenshot()

elif ACTION == "take_photo":
    take_photo()

elif ACTION == "volume_up":
    pyautogui.press("volumeup", presses=5)
    print("Volume increased")

elif ACTION == "volume_down":
    pyautogui.press("volumedown", presses=5)
    print("Volume decreased")

elif ACTION == "mute" or ACTION == "mute_volume":
    pyautogui.press("volumemute")
    print("Muted")

elif ACTION == "unmute" or ACTION == "unmute_volume":
    pyautogui.press("volumemute")
    print("Unmuted")

elif ACTION == "show_desktop":
    pyautogui.hotkey("win", "d")
    print("Showing desktop")

elif ACTION == "switch_window":
    pyautogui.hotkey("alt", "tab")
    print("Switched window")

elif ACTION == "minimize_all":
    pyautogui.hotkey("win", "m")
    print("Minimized all windows")

elif ACTION == "maximize_window":
    pyautogui.hotkey("win", "up")
    print("Maximized current window")

elif ACTION == "refresh_desktop":
    pyautogui.press("f5")
    print("Desktop refreshed")

elif ACTION == "shutdown":
    system_control("shutdown")

elif ACTION == "restart":
    system_control("restart")

elif ACTION == "lock" or ACTION == "lock_pc":
    system_control("lock")

elif ACTION == "delete_file":
    delete_path(TARGET)
elif ACTION == "pause_media":
    pyautogui.press("playpause")
    print("Media paused")

elif ACTION == "next_media":
    pyautogui.press("nexttrack")
    print("Next media")

elif ACTION == "previous_media":
    pyautogui.press("prevtrack")
    print("Previous media")

elif ACTION == "stop_media":
    pyautogui.press("stop")
    print("Stopped media")

elif ACTION == "mute_mic":
    pyautogui.hotkey("win", "alt", "k")
    print("Toggled microphone")

elif ACTION == "voice_typing":
    pyautogui.hotkey("win", "h")
    print("Voice typing opened")

else:
    print(f"Unknown action: {ACTION}")