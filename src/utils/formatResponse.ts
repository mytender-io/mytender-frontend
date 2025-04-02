export const formatResponse = (response: string): string => {
  // Handle numbered lists
  response = response.replace(/^\d+\.\s(.+)$/gm, "<li>$1</li>");
  if (response.includes("<li>")) {
    response = `<ol>${response}</ol>`;
  }

  // Handle bullet points
  response = response.replace(/^[-•]\s(.+)$/gm, "<li>$1</li>");
  if (response.includes("<li>") && !response.includes("<ol>")) {
    response = `<ul>${response}</ul>`;
  }

  // Handle bold text
  response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Handle italic text
  response = response.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Replace any newlines with a single <br>
  response = response.replace(/\n/g, "<br>");

  response = response.replace(/(<br>)\s*(<br>)/g, "<br><br>");
  response = response.replace(/(<\/li>)(<br>)+/g, "</li><br>");

  return response;
};
