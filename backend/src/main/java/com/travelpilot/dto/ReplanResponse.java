package com.travelpilot.dto;

import java.util.List;

/**
 * Response DTO for replan operation results.
 */
public class ReplanResponse {
    private boolean success;
    private String cancelledActivity;
    private String replacementActivity;
    private List<String> reasons;
    private String message;

    public ReplanResponse() {}

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getCancelledActivity() { return cancelledActivity; }
    public void setCancelledActivity(String cancelledActivity) { this.cancelledActivity = cancelledActivity; }
    public String getReplacementActivity() { return replacementActivity; }
    public void setReplacementActivity(String replacementActivity) { this.replacementActivity = replacementActivity; }
    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
