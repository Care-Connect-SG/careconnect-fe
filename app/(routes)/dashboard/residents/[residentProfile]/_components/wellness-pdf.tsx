"use client";

import { formatDayMonthYear } from "@/lib/utils";
import { ResidentRecord } from "@/types/resident";
import { WellnessReportRecord } from "@/types/wellness-report";
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

interface WellnessReportPDFProps {
  report: WellnessReportRecord;
  resident: ResidentRecord;
}

const WellnessReportPDF: React.FC<WellnessReportPDFProps> = ({
  report,
  resident,
}) => {
  const formatReportDate = (dateString: string) => {
    try {
      return formatDayMonthYear(new Date(dateString));
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Wellness Report</Text>

        <Text style={[styles.text, { textAlign: "center", marginBottom: 15 }]}>
          <Text style={styles.label}>Report Date: </Text>
          {formatReportDate(report.date)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Resident Information</Text>
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

        <View style={styles.separator} />

        <View style={styles.section}>
          {report.summary && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subtitle}>Summary</Text>
              <Text style={styles.text}>{report.summary}</Text>
            </View>
          )}

          {report.medical_summary && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subtitle}>Medical Summary</Text>
              <Text style={styles.text}>{report.medical_summary}</Text>
            </View>
          )}

          {report.medication_update && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subtitle}>Medication Update</Text>
              <Text style={styles.text}>{report.medication_update}</Text>
            </View>
          )}

          {report.nutrition_hydration && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subtitle}>Nutrition & Hydration</Text>
              <Text style={styles.text}>{report.nutrition_hydration}</Text>
            </View>
          )}

          {report.mobility_physical && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subtitle}>Mobility & Physical</Text>
              <Text style={styles.text}>{report.mobility_physical}</Text>
            </View>
          )}

          {report.cognitive_emotional && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subtitle}>Cognitive & Emotional</Text>
              <Text style={styles.text}>{report.cognitive_emotional}</Text>
            </View>
          )}

          {report.social_engagement && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subtitle}>Social Engagement</Text>
              <Text style={styles.text}>{report.social_engagement}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Created with CareConnect</Text>
          <Image src="/images/hand-heart.png" style={styles.logo} />
        </View>
      </Page>
    </Document>
  );
};

export default WellnessReportPDF;
