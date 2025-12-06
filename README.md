
## ZneT – AI IDE
**ZneT** is an AI-first web IDE built for developers — and for people who want to become developers.
It’s scrappy, fast, and built to help anyone start coding with the help of powerful AI agentic flows.

No installs. No setup. Just open the browser and build.

>  Powered by Groq + LLaMA3 + agentic tools  
>  Monaco Editor + Filesystem + Live Preview  
>  Build full projects. In-browser. With AI.

---
###  Live Demo

 [ZneT Dev](https://znetdev.vercel.app/)  
 No login needed. Just open and start building.

---

###  Features

-  Monaco-based multi-file code editor  
-  AI Agent (Groq + LLaMA3) with tool-calling support  
-  File Explorer with full file/folder structure  
-  Command palette & in-editor terminal (coming soon)  
-  Live browser preview for web apps  
-  Local file persistence (IndexedDB)

---

###  AI API Limitations

This project currently runs on a shared Groq API key with limited usage.  
To unlock full performance, you can add your own API key by editing the `.env`:

```env
GROQ_API_KEY=your-own-key-here
```

(Personal keys are recommended for power use )

---

### 🛠️ Tech Stack

- **Frontend:** Next.js, TypeScript, TailwindCSS  
- **Editor:** Monaco Editor  
- **AI Backend:** Groq + Tool-using LLaMA3 Agent  
- **Storage:** Local file system (IndexedDB)

---

###  How to Run Locally

```bash
git clone https://github.com/harsh-dev0/ZneT.dev.git
cd ZneT.dev
npm install
npm dev
```

Open http://localhost:3000 and start building.

---

###  AI Agent API

ZneT includes a TypeScript AI agent with tool-calling.  
You can define tools like `read_file`, `write_file`, etc., and the agent will plan tasks accordingly.

```ts
// Example Tool Definition
{
  name: "read_file",
  description: "Reads file content",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string" }
    },
    required: ["path"]
  }
}
```

Custom tools and plugin support coming soon.

---



###  Like It? Fuel It

If you liked it, consider supporting the hustle:  
[Buy me a coffee →](https://www.buymeacoffee.com/itshp7)

Every coffee = more features, fewer bugs, and less ramen.

---

###  Vision

I built ZneT to learn how AI agents actually work — not just use them, but *build* them.  
In the process, I realized how powerful they can be for people who don’t know how to code yet, but want to start.  

**ZneT is my way of giving them a head start.**  
AI that doesn't just autocomplete — it teaches, guides, and builds *with* you.


---
