"use client";

import { formatDayMonthYear } from "@/lib/utils";
import { FormResponse } from "@/types/form";
import { ReportResponse } from "@/types/report";
import { ResidentRecord } from "@/types/resident";
import { User } from "@/types/user";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, lineHeight: 1.5 },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "semibold",
    color: "#374151",
  },
  text: { fontSize: 12 },
  label: { fontWeight: "normal", color: "#374151" },
  section: { marginBottom: 12 },
  separator: { height: 0.8, backgroundColor: "#9CA3AF", marginVertical: 12 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    opacity: 0.6,
  },
  logo: {
    width: 10,
    height: 10,
    marginLeft: 5,
    opacity: 0.6,
  },
});

interface ReportPDFProps {
  form: FormResponse;
  report: ReportResponse;
  reporter: User | null;
  resident?: ResidentRecord;
}

const ReportPDF: React.FC<ReportPDFProps> = ({
  form,
  report,
  reporter,
  resident,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{form.title}</Text>

      <Text style={[styles.text, { textAlign: "center", marginBottom: 15 }]}>
        <Text style={styles.label}>Reported on: </Text>
        {formatDayMonthYear(new Date(report.created_at))} by {reporter?.name}
      </Text>

      {resident && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Primary Resident</Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Name: </Text>
            {resident.full_name}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Room: </Text>
            {resident.room_number}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>DOB: </Text>
            {resident.date_of_birth}
          </Text>
        </View>
      )}

      {report.involved_residents?.length &&
        report.involved_residents?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Involved Residents</Text>
            {report.involved_residents.map((res) => (
              <Text style={styles.text} key={res.id}>
                {res.name}
              </Text>
            ))}
          </View>
        )}

      <View style={styles.section}>
        <Text style={styles.subtitle}>Reporter</Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Name: </Text>
          {reporter?.name}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.label}>Role: </Text>
          {reporter?.organisation_rank} [{reporter?.role}]
        </Text>
      </View>

      {report.involved_caregivers?.length &&
        report.involved_caregivers?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Involved Caregivers</Text>
            {report.involved_caregivers.map((c) => (
              <Text style={styles.text} key={c.id}>
                {c.name}
              </Text>
            ))}
          </View>
        )}

      <View style={styles.separator} />

      <View style={styles.section}>
        {report.report_content
          .filter((section) => !!section.input)
          .map((section) => {
            const label = form.json_content.find(
              (element) => element.element_id === section.form_element_id,
            )?.label;

            return (
              <View key={section.form_element_id} style={{ marginBottom: 12 }}>
                <Text style={styles.subtitle}>{label}</Text>
                <Text style={styles.text}>{section.input}</Text>
              </View>
            );
          })}
      </View>

      <View style={styles.footer}>
        <Text>Created with CareConnect</Text>
        <Image src="/images/hand-heart.png" style={styles.logo} />
      </View>
    </Page>
  </Document>
);

export default ReportPDF;
