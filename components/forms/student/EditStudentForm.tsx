import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/context/AuthContext";
import StatusModal from "../../common/StatusModal";
import StepPersonal from "@/components/studentSteps/StepPersonal";
import StepAddress from "@/components/studentSteps/StepAddress";
import StepGuardian from "@/components/studentSteps/StepGuardian";
import StepEducation from "@/components/studentSteps/StepEducation";
import StepEnrollment from "@/components/studentSteps/StepEnrollment";
import { UpdateStudent } from "@/services/studentServices";
interface EditStudentFormProps {
  visible: boolean;
  details: any;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const steps = ["Personal", "Address", "Guardian", "Education", "Enrollment"];

const EditStudentForm: React.FC<EditStudentFormProps> = ({
  visible,
  details,
  onClose,
  onSubmit,
}) => {
  const { auth } = useAuth();
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (details) {
      setFormData({
        student_id: details.student_id || "",
        student_name: details.student_name || "",
        student_gender: details.student_gender || "",
        student_date_of_birth: details.student_date_of_birth || "",
        student_contact: details.student_contact || "",
        student_email: details.student_email || "",
        student_status: details.student_status || "",

        student_nationality: details.student_nationality || "",
        student_state: details.student_state || "",
        student_city: details.student_city || "",
        student_street: details.student_street || "",
        student_pincode: details.student_pincode || "",

        student_guardian_name: details.student_guardian_name || "",
        relation_to_student: details.relation_to_student || "",
        student_guardian_contact: details.student_guardian_contact || "",
        parent_occupation: details.parent_occupation || "",
        student_emergency_gurdian: details.student_emergency_gurdian || "",
        student_emergency_relation: details.student_emergency_relation || "",
        student_emergency_contact: details.student_emergency_contact || "",

        student_class: details.student_class || "",
        student_section: details.student_section || "",
        student_roll: details.student_roll || "",
        student_preffered_date: details.student_preffered_date || "",
        student_medical: details.student_medical || "",
        student_specify: details.student_specify || "",
        student_services: details.student_services || [],

        student_previous_school: details.student_previous_school || [],

        student_school: details.student_school || auth.schoolName,
        student_schoolid: details.student_schoolid || auth.roleId,
        student_created_by: details.student_created_by || auth.email,
        last_modified_by: auth.email,
        role: details.role || "student",
        password: details.password || "",
      });
    }
  }, [details]);

  const handleNext = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setModalSpinnerVisible(true);
    try {
      const response = await UpdateStudent(
        details.student_schoolid,
        details.student_id,
        formData
      );
      if (response?.data?.success) {
        setMessageStatus("Student updated successfully!");
        setStatus("success");
        setVisible(true);
        onSubmit(formData);
      } else {
        setMessageStatus(response?.data?.message || "Something went wrong.");
        setStatus("error");
        setVisible(true);
      }
    } catch (error: any) {
      setMessageStatus(error?.response?.data?.message || "Submission failed.");
      setStatus("error");
      setVisible(true);
    } finally {
      setModalSpinnerVisible(false);
    }
  };

  const stepProps = {
    onNext: handleNext,
    onBack: handleBack,
    formData,
    setFormData,
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold">
                Edit Student Details
              </Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={() => {
                  onClose();
                  setCurrentStep(0);
                }}
              >
                <Ionicons name="close-outline" size={26} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View className="flex-1 p-4 bg-white">
                <Text className="text-xl font-semibold text-primary mb-4">
                  {steps[currentStep]} details
                </Text>
                {currentStep === 0 && <StepPersonal {...stepProps} />}
                {currentStep === 1 && <StepAddress {...stepProps} />}
                {currentStep === 2 && <StepGuardian {...stepProps} />}
                {currentStep === 3 && <StepEducation {...stepProps} />}
                {currentStep === 4 && (
                  <StepEnrollment
                    onBack={handleBack}
                    onNext={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    isModalSpinnerVisible={isModalSpinnerVisible}
                  />
                )}
              </View>
            </ScrollView>

            <StatusModal
              visible={isVisible}
              status={status}
              message={messageStatus}
              onClose={() => {
                setVisible(false);
                if (status === "success") {
                  setTimeout(() => {
                    onClose();
                    setCurrentStep(0);
                  }, 200);
                }
              }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditStudentForm;
