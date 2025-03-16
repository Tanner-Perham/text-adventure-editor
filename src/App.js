// import React from "react";
// import DialogueEditor from "./components/DialogueEditor.js";
// import "./components/DialogueEditor.css";
//
// function App() {
//   return (
//     <div className="App">
//       <DialogueEditor />
//     </div>
//   );
// }
//
// export default App;
//
import React from "react";
import DialogueEditorContainer from "./features/dialogue/components/DialogueEditorContainer";
import "./components/DialogueEditor.css";
import "./components/QuestEditor.css";

function App() {
  return (
    <div className="App">
      <DialogueEditorContainer />
    </div>
  );
}

export default App;
