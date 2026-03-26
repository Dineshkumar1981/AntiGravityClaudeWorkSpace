package uk.telecom.o2c.web;

import lombok.RequiredArgsConstructor;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.history.HistoricActivityInstance;
import org.camunda.bpm.engine.history.HistoricProcessInstance;
import org.camunda.bpm.engine.runtime.ActivityInstance;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/processes")
@RequiredArgsConstructor
public class ProcessController {

    private final RuntimeService runtimeService;
    private final HistoryService historyService;

    @GetMapping("/instances")
    public List<Map<String, Object>> getInstances() {
        List<HistoricProcessInstance> instances = historyService.createHistoricProcessInstanceQuery()
                .orderByProcessInstanceStartTime().desc()
                .listPage(0, 50);

        List<Map<String, Object>> result = new ArrayList<>();
        for (HistoricProcessInstance pi : instances) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("processInstanceId", pi.getId());
            m.put("processDefinitionKey", pi.getProcessDefinitionKey());
            m.put("businessKey", pi.getBusinessKey());
            m.put("state", pi.getState());
            m.put("startTime", pi.getStartTime());
            m.put("endTime", pi.getEndTime());
            result.add(m);
        }
        return result;
    }

    @GetMapping("/active-node/{processInstanceId}")
    public Map<String, Object> getActiveNode(@PathVariable String processInstanceId) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("processInstanceId", processInstanceId);

        try {
            ActivityInstance ai = runtimeService.getActivityInstance(processInstanceId);
            if (ai != null) {
                result.put("activeActivityId", ai.getActivityId());
                List<String> childIds = new ArrayList<>();
                collectActivityIds(ai, childIds);
                result.put("activeActivityIds", childIds);
            }
        } catch (Exception e) {
            // Process may have ended — check history
            List<HistoricActivityInstance> hist = historyService.createHistoricActivityInstanceQuery()
                    .processInstanceId(processInstanceId)
                    .unfinished()
                    .list();
            if (!hist.isEmpty()) {
                result.put("activeActivityId", hist.get(0).getActivityId());
            }
        }
        return result;
    }

    private void collectActivityIds(ActivityInstance node, List<String> ids) {
        if (node.getActivityId() != null) ids.add(node.getActivityId());
        if (node.getChildActivityInstances() != null) {
            for (ActivityInstance child : node.getChildActivityInstances()) {
                collectActivityIds(child, ids);
            }
        }
    }
}
