import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import { GetBillById } from "@/services/studentServices";
import StatusModal from "@/components/common/StatusModal";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
type BillEntry = {
  _id: string;
  bill_id: string;
  bill_name: string;
  bill_description: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_contact: string;
  user_class: string;
  user_section: string;
  service_id: string;
  service_name: string;
  total_fee: string;
  total_discount: string;
  total_tax: string;
  fee_paid: string;
  due_amount: string;
  due_date: string;
  transcation_id: string;
  payment_method: string;
  payment_date: string;
  bank_name: string;
  bank_account: string;
  bill_status: string;
  bill_created_at: string;
  bill_created_by: string;
  bill_modified_at: string;
  bill_modified_by: string;
  bill_schoolid: string;
};

const statusColors: Record<string, string> = {
  paid: "#16a34a",
  pending: "#f59e0b",
  overdue: "#dc2626",
};

const BillPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { auth } = useAuth();
  const [details, setDetails] = useState<BillEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [html, setHtml] = useState("");
  const [invoiceData, setInvoiceData] = useState<object | null>(null);

  const fetchBill = async () => {
    if (!id || !auth.roleId) return;

    try {
      setLoading(true);
      const response = await GetBillById(auth.roleId, id);

      const { bill, institute, user } = response.data;
      const serviceItems = Array.isArray(bill.services)
        ? bill.services
        : [
            {
              service_id: bill.service_id,
              service_name: bill.service_name,
              total_fee: bill.total_fee,
              total_tax: bill.total_tax,
              fee_paid: bill.fee_paid,
              due_amount: bill.due_amount,
            },
          ];

      const invoiceData = {
        invoiceId: bill.bill_id || "INV-0001",
        dueDate: bill.due_date || "",
        invoiceDate:
          bill.payment_date ||
          bill.bill_created_at ||
          new Date().toISOString().split("T")[0],
        logoUrl:
          institute?.institute_logo ||
          "https://res.cloudinary.com/dtb4vozhy/image/upload/v1738045665/Modern_Digital_Messager_Apps_Logo_ytmvae.png",
        client: {
          name: user?.student_name || bill.user_name,
          email: user?.student_email || bill.user_email,
          street: user?.student_street || "N/A",
          city: user?.student_city || "",
          country: user?.student_nationality || "",
          zip: user?.student_pincode || "",
        },
        company: {
          name: institute?.institute_name || "Institute",
          email: institute?.institute_email || "admin@example.com",
          street: institute?.institute_street || "",
          city: institute?.institute_city || "",
          country: institute?.institute_nationality || "",
          zip: institute?.institute_pincode || "",
        },
        account: {
          holder: bill.bank_name || "N/A",
          number: bill.bank_account || "N/A",
          ifsc: institute?.school_ifsc || "N/A",
        },
        currency: "₹",
        total: parseFloat(bill.total_fee || "0"),
        items: serviceItems?.map((service: any) => ({
          id: service.service_id,
          name: service.service_name,
          total: parseFloat(service.total_fee || "0"),
          tax: parseFloat(service.total_tax || "0"),
          paid: parseFloat(service.fee_paid || "0"),
          due: parseFloat(service.due_amount || "0"),
        })),
      };
      setInvoiceData(invoiceData);
      setDetails(bill);
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to fetch bill details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id, auth.roleId]);

  const renderRow = (label: string, value?: string | number) => {
    if (!value || value === "none") return null;
    return (
      <View className="py-3 border-b border-gray-200">
        <Text className="text-xs text-gray-500 uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-base text-gray-800 font-medium mt-1">
          {value}
        </Text>
      </View>
    );
  };

  function generateInvoiceHTML(invoiceData: any) {
    const itemRows = (invoiceData?.items || [])
      .map(
        (item: any) => `
      <tr>
        <td>${item.id}</td>
        <td>${
          item.name.length > 20 ? item.name.slice(0, 20) + "..." : item.name
        }</td>
        <td>${invoiceData.currency}${item.total?.toFixed(2)}</td>
        <td>${item.tax}%</td>
        <td>${invoiceData.currency}${item.paid?.toFixed(2)}</td>
        <td>${invoiceData.currency}${item.due?.toFixed(2)}</td>
      </tr>`
      )
      .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
    body {
      font-family: 'Roboto', sans-serif;
      color: #333;
      position: relative;
    }
    .page {
      position: relative;
      padding: 40px 50px;
    }
    .backgroundContainer img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      margin-bottom: 70px;
    }
    .headerText {
      font-size: 16px;
      font-weight: bold;
      color: #026902;
    }
    .invoiceTitle {
      font-size: 24px;
      font-weight: bold;
    }
    .logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      padding: 3px;
      background: white;
    }
    .lightText {
      color: #eee;
      font-size: 10px;
      margin: 2px 0;
    }
    .boldText {
      font-weight: bold;
    }
    .infoBlock {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    .table th,
    .table td {
      border: 1px solid #bfbfbf;
      padding: 8px;
      font-size: 10px;
      text-align: left;
    }
    .table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .totalBlock {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .grandTotal {
      width: 40%;
      display: flex;
      justify-content: space-between;
      border-top: 2px solid #000;
      padding-top: 10px;
      font-weight: bold;
    }
    .paymentNoteBlock {
      margin-top: 30px;
    }
    .paymentInfo {
      font-size: 10px;
      line-height: 1.5;
    }
    .signatureBlock {
      margin-top: 100px;
      text-align: center;
      font-weight: 500;
      font-size: 16px;
    }
    .footer {
      margin-top: 60px;
      text-align: center;
      font-size: 10px;
      color: #555;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="backgroundContainer">
      <img src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1747633603/green_back_template_ij60h2.png" />
    </div>

    <div class="header">
      <div class="headerText">
        <div class="invoiceTitle">INVOICE</div>
        <div class="lightText">Invoice NO: ${invoiceData.invoiceId}</div>
        <div class="lightText">Due Date: ${invoiceData.dueDate}</div>
        <div class="lightText">Date: ${invoiceData.invoiceDate}</div>

      </div>
      <div style="text-align: right;">
        <img class="logo" src="${invoiceData.logoUrl}" alt="Logo" />
      </div>
    </div>

    <div class="infoBlock">
      <div style="width: 48%;">
        <div class="boldText">BILL TO:</div>
        <div class="lightText">${invoiceData.client.name}</div>
        <div class="lightText">${invoiceData.client.email}</div>
        <div class="lightText">${invoiceData.client.street}</div>
        <div class="lightText">${invoiceData.client.city}, ${
      invoiceData.client.country
    } ${invoiceData.client.zip}</div>
      </div>

      <div style="width: 48%;">
        <div class="boldText">BILL FROM:</div>
        <div class="lightText">${invoiceData.company.name}</div>
        <div class="lightText">${invoiceData.company.email}</div>
        <div class="lightText">${invoiceData.company.street}</div>
        <div class="lightText">${invoiceData.company.city}, ${
      invoiceData.company.country
    } ${invoiceData.company.zip}</div>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Service Id</th>
          <th>Name</th>
          <th>Total Fee</th>
          <th>Tax (%)</th>
          <th>Fee Paid</th>
          <th>Due</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totalBlock">
      <div class="grandTotal">
        <span>Total amount</span>
        <span>${invoiceData.currency}${invoiceData.total?.toFixed(2)}</span>
      </div>
    </div>

    <div class="paymentNoteBlock">
      <div>
        <div class="boldText">PAYMENT METHOD</div>
        <div class="paymentInfo">Account Holder: ${
          invoiceData.account.holder
        }</div>
        <div class="paymentInfo">Account No: ${invoiceData.account.number}</div>
        <div class="paymentInfo">IFSC Code: ${invoiceData.account.ifsc}</div>
      </div>
    </div>

    <div class="signatureBlock">
      <div class="boldText">Thank you!</div>
    </div>

    <div class="footer">
      <div>WONDIGI</div>
      <div>Thank you for your business!</div>
      <div>This is a system-generated invoice. No signature required.</div>
    </div>
  </div>
</body>
</html>`;
  }

  useEffect(() => {
    if (invoiceData) {
      const html = generateInvoiceHTML(invoiceData);
      setHtml(html);
    }
  }, [invoiceData]);

  const printToFile = async () => {
    setLoadingPrint(true);
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });

      setVisible(true);
      setStatus("success");
      setMessageStatus("Bill downloaded successfully.");
    } catch (error) {
      setVisible(true);
      setStatus("error");
      setMessageStatus("Failed to download bill.");
    } finally {
      setLoadingPrint(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.push("/home/billing")}>
          <Ionicons name="chevron-back-outline" size={28} color="#026902" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">
          Bill Details
        </Text>
        <TouchableOpacity onPress={printToFile}>
          {loadingPrint ? (
            <ActivityIndicator size="small" color="#026902" />
          ) : (
            <Ionicons name="download-outline" size={26} color="#026902" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="px-4 pt-5 pb-10"
      >
        {loading ? (
          <ActivityIndicator size="large" color="#026902" className="mt-10" />
        ) : details ? (
          <View className="space-y-4">
            <View className="border-b border-gray-200 pb-4">
              <Text className="text-xl font-bold text-gray-900">
                {details.bill_name} - {details.service_name} (Class{" "}
                {details.user_class}-{details.user_section})
              </Text>
              <View className="mt-2 flex-row items-center space-x-2">
                <Text className="text-sm text-gray-600 mr-5">Status:</Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      statusColors[details.bill_status.toLowerCase()] ||
                      "#9ca3af",
                  }}
                >
                  <Text className="text-white text-xs font-semibold capitalize">
                    {details.bill_status}
                  </Text>
                </View>
              </View>
              <View className="mt-2 flex-row items-center space-x-2">
                <Text className="text-sm text-gray-600 mr-5">
                  Bill modified by:
                </Text>
                <Text className="text-xs">
                  {details.bill_modified_by}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-x-4 justify-between">
              <View className="flex-1 min-w-[48%] space-y-2">
                {renderRow("Email", details.user_email)}
                {renderRow(
                  "Class-Section",
                  `${details.user_class}-${details.user_section}`
                )}
                {renderRow("Total Fee", details.total_fee)}
                {renderRow("Discount", details.total_discount)}
                {renderRow("Due Amount", details.due_amount)}
                {renderRow("Payment Method", details.payment_method)}
                {renderRow("Bank Name", details.bank_name)}
                {renderRow("Transaction ID", details.transcation_id)}
              </View>

              <View className="flex-1 min-w-[48%] space-y-2">
                {renderRow("User Name", details.user_name)}
                {renderRow("Contact", details.user_contact)}
                {renderRow("Service", details.service_name)}
                {renderRow("Tax", details.total_tax)}
                {renderRow("Fee Paid", details.fee_paid)}
                {renderRow("Due Date", details.due_date)}
                {renderRow("Payment Date", details.payment_date)}
              </View>
            </View>
            {renderRow("Bill Description", details.bill_description)}
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-10">
            No bill details found for ID: {id}
          </Text>
        )}
      </ScrollView>

      <StatusModal
        visible={visible}
        status={status}
        message={messageStatus}
        onClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
};

export default BillPage;
