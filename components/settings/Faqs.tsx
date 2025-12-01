import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Collapsible from "react-native-collapsible";

const faqs = [
  {
    question: "What is Wondigi?",
    answer:
      "Wondigi is an education management platform designed to manage students, staff, inventory, library, attendance, class notes, and more efficiently.",
  },
  {
    question: "Who can use Wondigi?",
    answer:
      "Wondigi is useful for schools, colleges, universities, and other educational institutions looking for a digital solution to streamline their administrative tasks.",
  },
  {
    question: "How does Wondigi help with student management?",
    answer:
      "Wondigi helps manage student records, attendance, performance tracking, and communication with parents or guardians, all in one place.",
  },
  {
    question: "Can Wondigi manage staff and teachers?",
    answer:
      "Yes, Wondigi allows institutions to manage staff records, payroll, attendance, and work schedules seamlessly.",
  },
  {
    question: "Does Wondigi include library management?",
    answer:
      "Yes, Wondigi offers a library management system to track book inventory, issue and return books, and maintain student borrowing records.",
  },
  {
    question: "How does Wondigi handle class notes and assignments?",
    answer:
      "Teachers can upload class notes, assignments, and other study materials, making them easily accessible to students anytime.",
  },
  {
    question: "Can Wondigi track student attendance?",
    answer:
      "Yes, Wondigi provides an attendance management feature that allows tracking of student and staff attendance digitally.",
  },
  {
    question: "Is Wondigi suitable for inventory management?",
    answer:
      "Yes, Wondigi includes an inventory management system that helps educational institutions keep track of assets, supplies, and other resources.",
  },
];

const Faqs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index: any) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} className="w-full py-4 h-[30vh]">
      {faqs.map((faq, index) => (
        <View key={index} className="mb-2.5 border-b border-gray-300">
          <TouchableOpacity
            onPress={() => toggleAccordion(index)}
            className="py-2"
          >
            <Text className="text-lg font-semibold text-primary">
              {faq.question}
            </Text>
          </TouchableOpacity>
          <Collapsible collapsed={activeIndex !== index}>
            <View className="py-2">
              <Text className="text-gray-700">{faq.answer}</Text>
            </View>
          </Collapsible>
        </View>
      ))}
    </ScrollView>
  );
};

export default Faqs;
