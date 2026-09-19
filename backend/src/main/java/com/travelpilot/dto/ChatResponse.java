package com.travelpilot.dto;

/**
 * Response DTO for AI chat messages.
 */
public class ChatResponse {
    private String reply;
    private String source; // "llm" or "fallback"

    public ChatResponse() {}

    public ChatResponse(String reply, String source) {
        this.reply = reply;
        this.source = source;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
