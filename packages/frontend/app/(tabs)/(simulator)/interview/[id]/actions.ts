"use server";

interface IAnswerResponse {
  answer: string;
}

export async function speakAnswer({
  interviewId,
  audio,
}: {
  interviewId: string;
  audio: Blob;
}) {
  const formData = new FormData();
  formData.append("interviewId", interviewId);
  formData.append("file", audio, "answer.webm");

  const reponse = await fetch("/interview/answer/voice", {
    method: "POST",
    body: formData,
  });


  if (!reponse.ok) {
    throw new Error("API 요청 실패");
  }

  const data = (await reponse.json()) as IAnswerResponse;
  return data;
}

export async function sendAnswer({
  interviewId,
  answer,
}: {
  interviewId: string;
  answer: string;
}) {
  const response = await fetch("/interview/answer/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ interviewId, answer }),
  });

  if (!response.ok) {
    throw new Error("API 요청 실패");
  }

  const data = (await response.json()) as IAnswerResponse;
  return data;
}
