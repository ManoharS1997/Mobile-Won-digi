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
import { PostStudents } from "@/services/studentServices";
interface StudentFormModalProps {
  visible: boolean;
  dataLen: number;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const steps = ["Personal", "Address", "Guardian", "Education", "Enrollment"];

const StudentFormModal: React.FC<StudentFormModalProps> = ({
  visible,
  dataLen,
  onClose,
  onSubmit,
}) => {
  const { auth } = useAuth();
  const [isVisible, setVisible] = useState(false);
  const [status, setStatus] = useState<"success" | "error">("success");
  const [messageStatus, setMessageStatus] = useState("");
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const generateStudentId = (length: number) => {
    const idNumber = length + 1;
    return `ST${String(idNumber).padStart(6, "0")}`;
  };
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData({
      ...formData,
      student_id: generateStudentId(dataLen),
      student_school: auth.schoolName,
      student_schoolid: auth.roleId,
      student_created_by: auth.email,
      last_modified_by: auth.email,
      role: "student",
      password: "123456",
    });
  }, [dataLen]);

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
      const response = await PostStudents(formData);
      if (response?.data?.success) {
        setMessageStatus("Student added successfully!");
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
              <Text className="text-lg font-semibold">Add Student Details</Text>
              <TouchableOpacity
                disabled={isModalSpinnerVisible}
                onPress={() => {
                  onClose();
                  setFormData({
                    student_id: generateStudentId(dataLen),
                    student_school: auth.schoolName,
                    student_schoolid: auth.roleId,
                    student_created_by: auth.email,
                    last_modified_by: auth.email,
                    role: "student",
                    password: "123456",
                  });
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
                    setFormData({
                      student_id: generateStudentId(dataLen),
                      student_school: auth.schoolName,
                      student_schoolid: auth.roleId,
                      student_created_by: auth.email,
                      last_modified_by: auth.email,
                      role: "student",
                      password: "123456",
                    });
                    setCurrentStep(0)
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

export default StudentFormModal;
