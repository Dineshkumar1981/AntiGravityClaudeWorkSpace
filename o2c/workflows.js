/* ============================================================
   O2C Platform — Workflow Engine
   Powered by bpmn-js (bpmn.io / Camunda open-source viewer)
   Three BPMN 2.0 process definitions:
     1. Order-to-Cash Main Process
     2. Collections & Dunning Process
     3. Dispute Resolution Process
   ============================================================ */
'use strict';

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — BPMN 2.0 XML Process Definitions
// ═══════════════════════════════════════════════════════════════
const WF_BPMN = {};

/* ── 1. Order-to-Cash Main Process ─────────────────────────── */
WF_BPMN.o2c_main = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Defs_O2C" targetNamespace="http://o2c.uk.telecom">

  <process id="proc_o2c" name="Order-to-Cash" isExecutable="true">
    <startEvent id="ev_start" name="Order&#10;Received"><outgoing>sf1</outgoing></startEvent>
    <sequenceFlow id="sf1" sourceRef="ev_start" targetRef="t_capture"/>
    <userTask id="t_capture" name="Order Capture&#10;&amp; Validation"><outgoing>sf2</outgoing></userTask>
    <sequenceFlow id="sf2" sourceRef="t_capture" targetRef="t_fraud"/>
    <serviceTask id="t_fraud" name="Fraud&#10;Screening (AI)"><outgoing>sf3</outgoing></serviceTask>
    <sequenceFlow id="sf3" sourceRef="t_fraud" targetRef="gw_fraud"/>
    <exclusiveGateway id="gw_fraud" name="Fraud?"><outgoing>sf4a</outgoing><outgoing>sf4b</outgoing></exclusiveGateway>
    <sequenceFlow id="sf4a" name="Clean" sourceRef="gw_fraud" targetRef="t_credit"/>
    <sequenceFlow id="sf4b" name="Flagged" sourceRef="gw_fraud" targetRef="ev_fraud"/>
    <userTask id="t_credit" name="Credit&#10;Assessment"><outgoing>sf5</outgoing></userTask>
    <sequenceFlow id="sf5" sourceRef="t_credit" targetRef="gw_credit"/>
    <exclusiveGateway id="gw_credit" name="Decision?"><outgoing>sf6a</outgoing><outgoing>sf6b</outgoing></exclusiveGateway>
    <sequenceFlow id="sf6a" name="Approved" sourceRef="gw_credit" targetRef="t_provision"/>
    <sequenceFlow id="sf6b" name="Declined" sourceRef="gw_credit" targetRef="ev_declined"/>
    <serviceTask id="t_provision" name="Service&#10;Provisioning"><outgoing>sf7</outgoing></serviceTask>
    <sequenceFlow id="sf7" sourceRef="t_provision" targetRef="t_billing"/>
    <serviceTask id="t_billing" name="Invoice&#10;Generation"><outgoing>sf8</outgoing></serviceTask>
    <sequenceFlow id="sf8" sourceRef="t_billing" targetRef="t_payment"/>
    <userTask id="t_payment" name="Payment&#10;Collection"><outgoing>sf9</outgoing></userTask>
    <sequenceFlow id="sf9" sourceRef="t_payment" targetRef="gw_payment"/>
    <exclusiveGateway id="gw_payment" name="Paid?"><outgoing>sf10a</outgoing><outgoing>sf10b</outgoing></exclusiveGateway>
    <sequenceFlow id="sf10a" name="Paid" sourceRef="gw_payment" targetRef="t_revenue"/>
    <sequenceFlow id="sf10b" name="Overdue" sourceRef="gw_payment" targetRef="t_dunning"/>
    <serviceTask id="t_dunning" name="Collections&#10;&amp; Dunning"><outgoing>sf11</outgoing></serviceTask>
    <sequenceFlow id="sf11" sourceRef="t_dunning" targetRef="t_payment"/>
    <serviceTask id="t_revenue" name="Revenue&#10;Recognition (IFRS 15)"><outgoing>sf12</outgoing></serviceTask>
    <sequenceFlow id="sf12" sourceRef="t_revenue" targetRef="ev_done"/>
    <endEvent id="ev_done" name="Cash&#10;Received"/>
    <endEvent id="ev_fraud" name="Fraud&#10;Rejected"/>
    <endEvent id="ev_declined" name="Credit&#10;Declined"/>
  </process>

  <bpmndi:BPMNDiagram id="diag_o2c">
    <bpmndi:BPMNPlane bpmnElement="proc_o2c">
      <bpmndi:BPMNShape id="sh_ev_start" bpmnElement="ev_start">
        <dc:Bounds x="62" y="182" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="45" y="225" width="72" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_capture" bpmnElement="t_capture">
        <dc:Bounds x="148" y="160" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_fraud" bpmnElement="t_fraud">
        <dc:Bounds x="308" y="160" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_gw_fraud" bpmnElement="gw_fraud" isMarkerVisible="true">
        <dc:Bounds x="468" y="175" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="478" y="232" width="32" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_credit" bpmnElement="t_credit">
        <dc:Bounds x="578" y="160" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_gw_credit" bpmnElement="gw_credit" isMarkerVisible="true">
        <dc:Bounds x="738" y="175" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="743" y="232" width="44" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_provision" bpmnElement="t_provision">
        <dc:Bounds x="848" y="160" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_billing" bpmnElement="t_billing">
        <dc:Bounds x="1008" y="160" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_payment" bpmnElement="t_payment">
        <dc:Bounds x="1168" y="160" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_gw_payment" bpmnElement="gw_payment" isMarkerVisible="true">
        <dc:Bounds x="1328" y="175" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="1338" y="232" width="28" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_revenue" bpmnElement="t_revenue">
        <dc:Bounds x="1438" y="160" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_ev_done" bpmnElement="ev_done">
        <dc:Bounds x="1598" y="182" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="1581" y="225" width="70" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_ev_fraud" bpmnElement="ev_fraud">
        <dc:Bounds x="475" y="342" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="456" y="385" width="74" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_ev_declined" bpmnElement="ev_declined">
        <dc:Bounds x="745" y="342" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="726" y="385" width="74" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_t_dunning" bpmnElement="t_dunning">
        <dc:Bounds x="1303" y="320" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <!-- Edges -->
      <bpmndi:BPMNEdge id="e_sf1" bpmnElement="sf1"><di:waypoint x="98" y="200"/><di:waypoint x="148" y="200"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf2" bpmnElement="sf2"><di:waypoint x="248" y="200"/><di:waypoint x="308" y="200"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf3" bpmnElement="sf3"><di:waypoint x="408" y="200"/><di:waypoint x="468" y="200"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf4a" bpmnElement="sf4a">
        <di:waypoint x="518" y="200"/><di:waypoint x="578" y="200"/>
        <bpmndi:BPMNLabel><dc:Bounds x="534" y="182" width="28" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf4b" bpmnElement="sf4b">
        <di:waypoint x="493" y="225"/><di:waypoint x="493" y="342"/>
        <bpmndi:BPMNLabel><dc:Bounds x="499" y="274" width="38" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf5" bpmnElement="sf5"><di:waypoint x="678" y="200"/><di:waypoint x="738" y="200"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf6a" bpmnElement="sf6a">
        <di:waypoint x="788" y="200"/><di:waypoint x="848" y="200"/>
        <bpmndi:BPMNLabel><dc:Bounds x="800" y="182" width="48" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf6b" bpmnElement="sf6b">
        <di:waypoint x="763" y="225"/><di:waypoint x="763" y="342"/>
        <bpmndi:BPMNLabel><dc:Bounds x="769" y="274" width="44" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf7" bpmnElement="sf7"><di:waypoint x="948" y="200"/><di:waypoint x="1008" y="200"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf8" bpmnElement="sf8"><di:waypoint x="1108" y="200"/><di:waypoint x="1168" y="200"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf9" bpmnElement="sf9"><di:waypoint x="1268" y="200"/><di:waypoint x="1328" y="200"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf10a" bpmnElement="sf10a">
        <di:waypoint x="1378" y="200"/><di:waypoint x="1438" y="200"/>
        <bpmndi:BPMNLabel><dc:Bounds x="1394" y="182" width="22" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf10b" bpmnElement="sf10b">
        <di:waypoint x="1353" y="225"/><di:waypoint x="1353" y="320"/>
        <bpmndi:BPMNLabel><dc:Bounds x="1359" y="262" width="46" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf11" bpmnElement="sf11">
        <di:waypoint x="1303" y="360"/><di:waypoint x="1218" y="360"/><di:waypoint x="1218" y="240"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="e_sf12" bpmnElement="sf12"><di:waypoint x="1538" y="200"/><di:waypoint x="1598" y="200"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

/* ── 2. Collections & Dunning Process ──────────────────────── */
WF_BPMN.dunning = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Defs_Dunning" targetNamespace="http://o2c.uk.telecom/dunning">

  <process id="proc_dunning" name="Collections &amp; Dunning" isExecutable="true">
    <startEvent id="dun_start" name="Invoice&#10;Overdue"><outgoing>dsf1</outgoing></startEvent>
    <sequenceFlow id="dsf1" sourceRef="dun_start" targetRef="dun_t1"/>
    <userTask id="dun_t1" name="Stage 1&#10;Reminder (14d)"><outgoing>dsf2</outgoing></userTask>
    <sequenceFlow id="dsf2" sourceRef="dun_t1" targetRef="dun_gw1"/>
    <exclusiveGateway id="dun_gw1" name="Paid?"><outgoing>dsf3a</outgoing><outgoing>dsf3b</outgoing></exclusiveGateway>
    <sequenceFlow id="dsf3a" name="Yes" sourceRef="dun_gw1" targetRef="dun_paid1"/>
    <sequenceFlow id="dsf3b" name="No" sourceRef="dun_gw1" targetRef="dun_t2"/>
    <endEvent id="dun_paid1" name="Payment&#10;Received"/>
    <userTask id="dun_t2" name="Stage 2&#10;Warning (7d)"><outgoing>dsf4</outgoing></userTask>
    <sequenceFlow id="dsf4" sourceRef="dun_t2" targetRef="dun_gw2"/>
    <exclusiveGateway id="dun_gw2" name="Paid?"><outgoing>dsf5a</outgoing><outgoing>dsf5b</outgoing></exclusiveGateway>
    <sequenceFlow id="dsf5a" name="Yes" sourceRef="dun_gw2" targetRef="dun_paid2"/>
    <sequenceFlow id="dsf5b" name="No" sourceRef="dun_gw2" targetRef="dun_t3"/>
    <endEvent id="dun_paid2" name="Payment&#10;Received"/>
    <userTask id="dun_t3" name="Stage 3&#10;Final Notice (7d)"><outgoing>dsf6</outgoing></userTask>
    <sequenceFlow id="dsf6" sourceRef="dun_t3" targetRef="dun_gw3"/>
    <exclusiveGateway id="dun_gw3" name="Paid?"><outgoing>dsf7a</outgoing><outgoing>dsf7b</outgoing></exclusiveGateway>
    <sequenceFlow id="dsf7a" name="Yes" sourceRef="dun_gw3" targetRef="dun_paid3"/>
    <sequenceFlow id="dsf7b" name="No" sourceRef="dun_gw3" targetRef="dun_t4"/>
    <endEvent id="dun_paid3" name="Payment&#10;Received"/>
    <serviceTask id="dun_t4" name="Stage 4&#10;Suspension"><outgoing>dsf8</outgoing></serviceTask>
    <sequenceFlow id="dsf8" sourceRef="dun_t4" targetRef="dun_end"/>
    <endEvent id="dun_end" name="Service&#10;Suspended"/>
  </process>

  <bpmndi:BPMNDiagram id="diag_dunning">
    <bpmndi:BPMNPlane bpmnElement="proc_dunning">
      <bpmndi:BPMNShape id="sh_dun_start" bpmnElement="dun_start">
        <dc:Bounds x="62" y="162" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="45" y="205" width="72" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_t1" bpmnElement="dun_t1">
        <dc:Bounds x="148" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_gw1" bpmnElement="dun_gw1" isMarkerVisible="true">
        <dc:Bounds x="308" y="155" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="318" y="212" width="28" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_paid1" bpmnElement="dun_paid1">
        <dc:Bounds x="315" y="302" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="298" y="345" width="72" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_t2" bpmnElement="dun_t2">
        <dc:Bounds x="418" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_gw2" bpmnElement="dun_gw2" isMarkerVisible="true">
        <dc:Bounds x="578" y="155" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="588" y="212" width="28" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_paid2" bpmnElement="dun_paid2">
        <dc:Bounds x="585" y="302" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="568" y="345" width="72" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_t3" bpmnElement="dun_t3">
        <dc:Bounds x="688" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_gw3" bpmnElement="dun_gw3" isMarkerVisible="true">
        <dc:Bounds x="848" y="155" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="858" y="212" width="28" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_paid3" bpmnElement="dun_paid3">
        <dc:Bounds x="855" y="302" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="838" y="345" width="72" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_t4" bpmnElement="dun_t4">
        <dc:Bounds x="958" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dun_end" bpmnElement="dun_end">
        <dc:Bounds x="1118" y="162" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="1101" y="205" width="72" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <!-- Edges -->
      <bpmndi:BPMNEdge id="de_dsf1" bpmnElement="dsf1"><di:waypoint x="98" y="180"/><di:waypoint x="148" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf2" bpmnElement="dsf2"><di:waypoint x="248" y="180"/><di:waypoint x="308" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf3a" bpmnElement="dsf3a">
        <di:waypoint x="333" y="205"/><di:waypoint x="333" y="302"/>
        <bpmndi:BPMNLabel><dc:Bounds x="339" y="250" width="18" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf3b" bpmnElement="dsf3b">
        <di:waypoint x="358" y="180"/><di:waypoint x="418" y="180"/>
        <bpmndi:BPMNLabel><dc:Bounds x="374" y="162" width="16" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf4" bpmnElement="dsf4"><di:waypoint x="518" y="180"/><di:waypoint x="578" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf5a" bpmnElement="dsf5a">
        <di:waypoint x="603" y="205"/><di:waypoint x="603" y="302"/>
        <bpmndi:BPMNLabel><dc:Bounds x="609" y="250" width="18" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf5b" bpmnElement="dsf5b">
        <di:waypoint x="628" y="180"/><di:waypoint x="688" y="180"/>
        <bpmndi:BPMNLabel><dc:Bounds x="644" y="162" width="16" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf6" bpmnElement="dsf6"><di:waypoint x="788" y="180"/><di:waypoint x="848" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf7a" bpmnElement="dsf7a">
        <di:waypoint x="873" y="205"/><di:waypoint x="873" y="302"/>
        <bpmndi:BPMNLabel><dc:Bounds x="879" y="250" width="18" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf7b" bpmnElement="dsf7b">
        <di:waypoint x="898" y="180"/><di:waypoint x="958" y="180"/>
        <bpmndi:BPMNLabel><dc:Bounds x="914" y="162" width="16" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dsf8" bpmnElement="dsf8"><di:waypoint x="1058" y="180"/><di:waypoint x="1118" y="180"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

/* ── 3. Dispute Resolution Process ─────────────────────────── */
WF_BPMN.dispute = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Defs_Dispute" targetNamespace="http://o2c.uk.telecom/dispute">

  <process id="proc_dispute" name="Dispute Resolution" isExecutable="true">
    <startEvent id="dis_start" name="Dispute&#10;Raised"><outgoing>dspsf1</outgoing></startEvent>
    <sequenceFlow id="dspsf1" sourceRef="dis_start" targetRef="dis_triage"/>
    <userTask id="dis_triage" name="Initial&#10;Triage"><outgoing>dspsf2</outgoing></userTask>
    <sequenceFlow id="dspsf2" sourceRef="dis_triage" targetRef="dis_invest"/>
    <userTask id="dis_invest" name="Investigation&#10;&amp; Review"><outgoing>dspsf3</outgoing></userTask>
    <sequenceFlow id="dspsf3" sourceRef="dis_invest" targetRef="dis_gw"/>
    <exclusiveGateway id="dis_gw" name="Decision?"><outgoing>dspsf4a</outgoing><outgoing>dspsf4b</outgoing></exclusiveGateway>
    <sequenceFlow id="dspsf4a" name="Upheld" sourceRef="dis_gw" targetRef="dis_credit"/>
    <sequenceFlow id="dspsf4b" name="Rejected" sourceRef="dis_gw" targetRef="dis_reject"/>
    <serviceTask id="dis_credit" name="Issue&#10;Credit Note"><outgoing>dspsf5a</outgoing></serviceTask>
    <sequenceFlow id="dspsf5a" sourceRef="dis_credit" targetRef="dis_rca"/>
    <userTask id="dis_reject" name="Rejection&#10;Notification"><outgoing>dspsf5b</outgoing></userTask>
    <sequenceFlow id="dspsf5b" sourceRef="dis_reject" targetRef="dis_rca"/>
    <serviceTask id="dis_rca" name="Root Cause&#10;Analysis"><outgoing>dspsf6</outgoing></serviceTask>
    <sequenceFlow id="dspsf6" sourceRef="dis_rca" targetRef="dis_end"/>
    <endEvent id="dis_end" name="Dispute&#10;Resolved"/>
  </process>

  <bpmndi:BPMNDiagram id="diag_dispute">
    <bpmndi:BPMNPlane bpmnElement="proc_dispute">
      <bpmndi:BPMNShape id="sh_dis_start" bpmnElement="dis_start">
        <dc:Bounds x="62" y="162" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="46" y="205" width="70" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dis_triage" bpmnElement="dis_triage">
        <dc:Bounds x="148" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dis_invest" bpmnElement="dis_invest">
        <dc:Bounds x="308" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dis_gw" bpmnElement="dis_gw" isMarkerVisible="true">
        <dc:Bounds x="468" y="155" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="471" y="212" width="46" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dis_credit" bpmnElement="dis_credit">
        <dc:Bounds x="578" y="140" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dis_reject" bpmnElement="dis_reject">
        <dc:Bounds x="578" y="290" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dis_rca" bpmnElement="dis_rca">
        <dc:Bounds x="738" y="215" width="100" height="80"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="sh_dis_end" bpmnElement="dis_end">
        <dc:Bounds x="898" y="237" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="881" y="280" width="70" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <!-- Edges -->
      <bpmndi:BPMNEdge id="de_dspsf1" bpmnElement="dspsf1"><di:waypoint x="98" y="180"/><di:waypoint x="148" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dspsf2" bpmnElement="dspsf2"><di:waypoint x="248" y="180"/><di:waypoint x="308" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dspsf3" bpmnElement="dspsf3"><di:waypoint x="408" y="180"/><di:waypoint x="468" y="180"/></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dspsf4a" bpmnElement="dspsf4a">
        <di:waypoint x="518" y="180"/><di:waypoint x="578" y="180"/>
        <bpmndi:BPMNLabel><dc:Bounds x="531" y="162" width="38" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dspsf4b" bpmnElement="dspsf4b">
        <di:waypoint x="493" y="205"/><di:waypoint x="493" y="330"/><di:waypoint x="578" y="330"/>
        <bpmndi:BPMNLabel><dc:Bounds x="499" y="255" width="44" height="14"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dspsf5a" bpmnElement="dspsf5a">
        <di:waypoint x="678" y="180"/><di:waypoint x="788" y="180"/><di:waypoint x="788" y="215"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dspsf5b" bpmnElement="dspsf5b">
        <di:waypoint x="678" y="330"/><di:waypoint x="788" y="330"/><di:waypoint x="788" y="295"/>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="de_dspsf6" bpmnElement="dspsf6"><di:waypoint x="838" y="255"/><di:waypoint x="898" y="255"/></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — Workflow Engine
// ═══════════════════════════════════════════════════════════════

/* Maps entity status → active BPMN node ID */
const WF_STATUS_MAP = {
  o2c_main: {
    // Orders
    'new':          'ev_start',
    'validated':    't_capture',
    'credit-check': 't_credit',
    'provisioning': 't_provision',
    'active':       't_billing',
    'suspended':    't_dunning',
    'cancelled':    'ev_declined',
    // Invoices
    'issued':       't_billing',
    'overdue':      't_dunning',
    'paid':         't_revenue',
    'disputed':     't_dunning',
    // Terminal
    'completed':    'ev_done',
    'rejected':     'ev_fraud',
  },
  dunning: {
    1: 'dun_t1',
    2: 'dun_t2',
    3: 'dun_t3',
    4: 'dun_t4',
    'resolved': 'dun_paid3',
    'suspended': 'dun_end',
  },
  dispute: {
    'open':         'dis_triage',
    'under-review': 'dis_invest',
    'upheld':       'dis_credit',
    'rejected':     'dis_reject',
    'resolved':     'dis_end',
  },
};

/* Process metadata */
const WF_META = {
  o2c_main: { label: 'Order-to-Cash',           icon: '⚡', color: '#0066cc' },
  dunning:  { label: 'Collections & Dunning',    icon: '📬', color: '#f59e0b' },
  dispute:  { label: 'Dispute Resolution',       icon: '⚖️',  color: '#8b5cf6' },
};

/* Node labels for the legend */
const WF_NODE_LABELS = {
  o2c_main: {
    ev_start:   { label: 'Order Received',          type: 'event' },
    t_capture:  { label: 'Order Capture',           type: 'task'  },
    t_fraud:    { label: 'Fraud Screening',         type: 'task'  },
    gw_fraud:   { label: 'Fraud Gateway',           type: 'gw'    },
    t_credit:   { label: 'Credit Assessment',       type: 'task'  },
    gw_credit:  { label: 'Credit Decision',         type: 'gw'    },
    t_provision:{ label: 'Service Provisioning',    type: 'task'  },
    t_billing:  { label: 'Invoice Generation',      type: 'task'  },
    t_payment:  { label: 'Payment Collection',      type: 'task'  },
    gw_payment: { label: 'Payment Gateway',         type: 'gw'    },
    t_dunning:  { label: 'Collections & Dunning',   type: 'task'  },
    t_revenue:  { label: 'Revenue Recognition',     type: 'task'  },
    ev_done:    { label: 'Cash Received',           type: 'event' },
    ev_fraud:   { label: 'Fraud Rejected',          type: 'end'   },
    ev_declined:{ label: 'Credit Declined',         type: 'end'   },
  },
  dunning: {
    dun_start:  { label: 'Invoice Overdue',         type: 'event' },
    dun_t1:     { label: 'Stage 1 — Reminder',      type: 'task'  },
    dun_gw1:    { label: 'Stage 1 Check',           type: 'gw'    },
    dun_t2:     { label: 'Stage 2 — Warning',       type: 'task'  },
    dun_gw2:    { label: 'Stage 2 Check',           type: 'gw'    },
    dun_t3:     { label: 'Stage 3 — Final Notice',  type: 'task'  },
    dun_gw3:    { label: 'Stage 3 Check',           type: 'gw'    },
    dun_t4:     { label: 'Stage 4 — Suspension',    type: 'task'  },
    dun_paid1:  { label: 'Paid (S1)',               type: 'end'   },
    dun_paid2:  { label: 'Paid (S2)',               type: 'end'   },
    dun_paid3:  { label: 'Paid (S3)',               type: 'end'   },
    dun_end:    { label: 'Service Suspended',       type: 'end'   },
  },
  dispute: {
    dis_start:  { label: 'Dispute Raised',          type: 'event' },
    dis_triage: { label: 'Initial Triage',          type: 'task'  },
    dis_invest: { label: 'Investigation',           type: 'task'  },
    dis_gw:     { label: 'Decision Gateway',        type: 'gw'    },
    dis_credit: { label: 'Issue Credit Note',       type: 'task'  },
    dis_reject: { label: 'Rejection Notice',        type: 'task'  },
    dis_rca:    { label: 'Root Cause Analysis',     type: 'task'  },
    dis_end:    { label: 'Dispute Resolved',        type: 'end'   },
  },
};

const WorkflowEngine = {
  _k: 'o2c.wf.instances',

  getAll() { return JSON.parse(localStorage.getItem(this._k) || '[]'); },
  saveAll(arr) { localStorage.setItem(this._k, JSON.stringify(arr)); },

  create(processKey, entityType, entityId, entityLabel, nodeId) {
    const inst = {
      instanceId: 'WF-' + Math.random().toString(36).slice(2,9).toUpperCase(),
      processKey, entityType, entityId, entityLabel, nodeId,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ nodeId, ts: new Date().toISOString(), note: 'Process started' }],
    };
    const arr = this.getAll();
    arr.push(inst);
    this.saveAll(arr);
    return inst;
  },

  advance(instanceId, newNodeId, note) {
    const arr = this.getAll();
    const idx = arr.findIndex(i => i.instanceId === instanceId);
    if (idx < 0) return null;
    arr[idx].nodeId = newNodeId;
    arr[idx].updatedAt = new Date().toISOString();
    arr[idx].history.push({ nodeId: newNodeId, ts: new Date().toISOString(), note: note || 'Advanced' });
    this.saveAll(arr);
    return arr[idx];
  },

  getByEntity(entityType, entityId) {
    return this.getAll().find(i => i.entityType === entityType && i.entityId === entityId) || null;
  },

  getByProcess(processKey) {
    return this.getAll().filter(i => i.processKey === processKey);
  },

  statusToNode(processKey, status) {
    const map = WF_STATUS_MAP[processKey] || {};
    return map[status] || null;
  },

  /* Seed process instances from existing entities */
  syncFromEntities() {
    const existing = this.getAll();
    const existIds = new Set(existing.map(i => i.entityId));

    const toCreate = [];

    Store.getAll('orders').forEach(o => {
      if (!existIds.has(o.orderId)) {
        const nodeId = this.statusToNode('o2c_main', o.status) || 'ev_start';
        toCreate.push({ key:'o2c_main', type:'order', id:o.orderId, label:`${o.orderId} — ${o.customerName}`, node:nodeId });
      }
    });
    Store.getAll('collections').forEach(c => {
      if (!existIds.has(c.collectionId)) {
        const nodeId = this.statusToNode('dunning', c.dunningStage) || 'dun_t1';
        toCreate.push({ key:'dunning', type:'collection', id:c.collectionId, label:`${c.collectionId} — ${c.customerName}`, node:nodeId });
      }
    });
    Store.getAll('disputes').forEach(d => {
      if (!existIds.has(d.disputeId)) {
        const nodeId = this.statusToNode('dispute', d.status) || 'dis_triage';
        toCreate.push({ key:'dispute', type:'dispute', id:d.disputeId, label:`${d.disputeId} — ${d.customerName}`, node:nodeId });
      }
    });

    toCreate.forEach(x => this.create(x.key, x.type, x.id, x.label, x.node));
  },
};

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — BPMN Viewer Helper
// ═══════════════════════════════════════════════════════════════
const BpmnRenderer = {
  _viewers: {},   // containerId → BpmnJS instance

  async render(containerId, processKey, activeNodeId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Destroy previous viewer in this container
    if (this._viewers[containerId]) {
      try { this._viewers[containerId].destroy(); } catch(e) { /* ignore */ }
      delete this._viewers[containerId];
    }

    container.innerHTML = '';

    if (typeof BpmnJS === 'undefined') {
      container.innerHTML = '<div class="bpmn-error">⚠️ bpmn-js library not loaded</div>';
      return;
    }

    const xml = WF_BPMN[processKey];
    if (!xml) { container.innerHTML = '<div class="bpmn-error">No BPMN definition found</div>'; return; }

    const viewer = new BpmnJS({ container });
    this._viewers[containerId] = viewer;

    try {
      await viewer.importXML(xml);
      const canvas = viewer.get('canvas');
      canvas.zoom('fit-viewport', 'auto');

      // Highlight active node
      if (activeNodeId) {
        try {
          canvas.addMarker(activeNodeId, 'wf-active');
        } catch(e) { /* element might not exist */ }
      }
    } catch (err) {
      container.innerHTML = `<div class="bpmn-error">⚠️ Render error: ${err.message}</div>`;
    }
  },

  destroyAll() {
    Object.values(this._viewers).forEach(v => { try { v.destroy(); } catch(e) {} });
    this._viewers = {};
  },
};

// ═══════════════════════════════════════════════════════════════
// SECTION 4 — Processes Module UI
// ═══════════════════════════════════════════════════════════════
function renderProcesses() {
  WorkflowEngine.syncFromEntities();

  const mc = document.getElementById('main-content');
  const allInstances = WorkflowEngine.getAll();

  mc.innerHTML = `
    <div class="section-hdr">
      <h2>BPM Process Monitor</h2>
      <span class="badge badge-info">bpmn-js (Camunda open-source)</span>
    </div>

    <div class="alert info" style="margin-bottom:16px">
      <span class="alert-icon">ℹ️</span>
      <div class="alert-body">
        <div class="alert-title">BPMN 2.0 Process Orchestration</div>
        Powered by <strong>bpmn-js</strong> — the same open-source engine used by Flowable, Camunda, and Activiti.
        Each order, collection, and dispute runs as a live process instance with real-time position tracking.
      </div>
    </div>

    <!-- Process Definition Cards -->
    <div class="proc-def-grid" id="proc-def-grid">
      ${Object.entries(WF_META).map(([key, m]) => {
        const instances = WorkflowEngine.getByProcess(key);
        return `
        <div class="proc-def-card" data-prockey="${key}">
          <div class="proc-def-hdr">
            <span class="proc-def-icon">${m.icon}</span>
            <div>
              <div class="proc-def-name">${m.label}</div>
              <div class="proc-def-sub">BPMN 2.0 — ${instances.length} active instance${instances.length!==1?'s':''}</div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="WF_showProcess('${key}')">View Diagram</button>
        </div>`;
      }).join('')}
    </div>

    <!-- BPMN Diagram Viewer -->
    <div class="card" id="bpmn-viewer-card" style="display:none;margin-top:20px">
      <div class="bpmn-viewer-hdr">
        <div>
          <span id="bpmn-viewer-title" style="font-weight:700;font-size:15px"></span>
          <span id="bpmn-viewer-badge" class="badge badge-info" style="margin-left:8px"></span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('bpmn-viewer-card').style.display='none'">✕ Close</button>
      </div>
      <div id="bpmn-canvas" class="bpmn-canvas"></div>
      <div class="bpmn-legend" id="bpmn-legend"></div>
    </div>

    <!-- Process Instance List -->
    <div class="card" style="margin-top:20px">
      <div class="section-hdr" style="margin-bottom:12px">
        <h2>Live Process Instances</h2>
        <div style="display:flex;gap:8px">
          <select class="filter-select" id="pi-filter-proc" onchange="WF_filterInstances()">
            <option value="">All Processes</option>
            ${Object.entries(WF_META).map(([k,m])=>`<option value="${k}">${m.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Instance ID</th><th>Process</th><th>Entity</th><th>Current Step</th><th>Started</th><th>Actions</th>
          </tr></thead>
          <tbody id="pi-table-body">
            ${renderInstanceRows(allInstances)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderInstanceRows(instances) {
  if (!instances.length) return '<tr><td colspan="6" class="empty-state">No process instances</td></tr>';
  return instances.map(inst => {
    const meta = WF_META[inst.processKey] || {};
    const nodeInfo = (WF_NODE_LABELS[inst.processKey] || {})[inst.nodeId] || { label: inst.nodeId, type: 'task' };
    const nodeTypeClass = { event:'badge-muted', task:'badge-info', gw:'badge-warning', end:'badge-success' }[nodeInfo.type] || 'badge-muted';
    const startDt = inst.startedAt ? new Date(inst.startedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : '—';
    return `<tr>
      <td><span class="td-mono">${inst.instanceId}</span></td>
      <td><span style="margin-right:4px">${meta.icon||'⚡'}</span>${meta.label||inst.processKey}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${inst.entityLabel}">${inst.entityLabel}</td>
      <td><span class="badge ${nodeTypeClass}">${nodeInfo.label}</span></td>
      <td class="td-muted">${startDt}</td>
      <td>
        <button class="btn btn-ghost btn-xs" onclick="WF_showInstance('${inst.instanceId}')">🔍 Inspect</button>
      </td>
    </tr>`;
  }).join('');
}

// ── Global Callbacks ───────────────────────────────────────────
window.WF_showProcess = function(processKey) {
  const meta = WF_META[processKey];
  const card = document.getElementById('bpmn-viewer-card');
  const title = document.getElementById('bpmn-viewer-title');
  const badge = document.getElementById('bpmn-viewer-badge');
  const legend = document.getElementById('bpmn-legend');

  title.textContent = meta.label;
  badge.textContent = 'BPMN 2.0';
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Render legend
  const nodes = WF_NODE_LABELS[processKey] || {};
  legend.innerHTML = `
    <div class="bpmn-legend-title">Flow Elements</div>
    <div class="bpmn-legend-items">
      ${Object.entries(nodes).map(([id, n]) => {
        const cls = { event:'legend-event', task:'legend-task', gw:'legend-gw', end:'legend-end' }[n.type] || 'legend-task';
        return `<div class="legend-item"><span class="legend-dot ${cls}"></span>${n.label}</div>`;
      }).join('')}
    </div>`;

  BpmnRenderer.render('bpmn-canvas', processKey, null);
};

window.WF_showInstance = function(instanceId) {
  const inst = WorkflowEngine.getAll().find(i => i.instanceId === instanceId);
  if (!inst) return;

  const meta = WF_META[inst.processKey] || {};
  const nodes = WF_NODE_LABELS[inst.processKey] || {};
  const activeNode = nodes[inst.nodeId] || { label: inst.nodeId, type: 'task' };

  const card = document.getElementById('bpmn-viewer-card');
  const title = document.getElementById('bpmn-viewer-title');
  const badge = document.getElementById('bpmn-viewer-badge');
  const legend = document.getElementById('bpmn-legend');

  title.textContent = `${meta.label} — ${inst.entityLabel}`;
  badge.textContent = `Active: ${activeNode.label}`;
  badge.className = 'badge badge-warning';
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // History timeline in legend area
  legend.innerHTML = `
    <div class="bpmn-legend-title">📍 Current: <strong>${activeNode.label}</strong></div>
    <div class="bpmn-legend-title" style="margin-top:12px">Process History</div>
    <div class="timeline" style="margin-top:8px">
      ${[...inst.history].reverse().slice(0,6).map(h => {
        const n = nodes[h.nodeId] || { label: h.nodeId, type: 'task' };
        const ts = new Date(h.ts).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
        return `<div class="tl-item">
          <div class="tl-icon ${h.nodeId === inst.nodeId ? 'success' : ''}">${h.nodeId === inst.nodeId ? '📍' : '✓'}</div>
          <div class="tl-body"><div class="tl-title">${n.label}</div><div class="tl-meta">${ts} — ${h.note}</div></div>
        </div>`;
      }).join('')}
    </div>`;

  BpmnRenderer.render('bpmn-canvas', inst.processKey, inst.nodeId);
};

window.WF_filterInstances = function() {
  const filter = document.getElementById('pi-filter-proc')?.value || '';
  const all = WorkflowEngine.getAll();
  const filtered = filter ? all.filter(i => i.processKey === filter) : all;
  const tbody = document.getElementById('pi-table-body');
  if (tbody) tbody.innerHTML = renderInstanceRows(filtered);
};

// ═══════════════════════════════════════════════════════════════
// SECTION 5 — Register the Processes Module
// ═══════════════════════════════════════════════════════════════
(function registerWorkflowModule() {
  // Wait for Router to be defined in app.js
  function tryRegister() {
    if (typeof Router !== 'undefined' && Router.reg) {
      Router.reg('processes', renderProcesses);
    } else {
      setTimeout(tryRegister, 50);
    }
  }
  tryRegister();
})();
