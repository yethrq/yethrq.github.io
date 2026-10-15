const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

marked.setOptions({
  breaks:true
});

editor.value = "# Hello Markdown";

function updatePreview(){
preview.innerHTML = marked.parse(editor.value);
}

editor.addEventListener("input", updatePreview);

updatePreview();
