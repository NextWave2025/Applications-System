import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar, Phone, Mail, User } from "lucide-react";

export default function ConsultationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studyField: "",
    currentEducation: "",
    preferredIntake: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const studyFields = [
    "Business Administration",
    "Engineering",
    "Computer Science",
    "Medicine",
    "Architecture",
    "Finance",
    "Marketing",
    "International Relations",
    "Arts & Design",
  ];

  const intakes = [
    "September 2025",
    "January 2026",
    "September 2026",
    "I'm flexible",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send consultation request to our backend
      const response = await fetch('/api/consultation-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'consultation_form'
        }),
      });

      if (response.ok) {
        alert(
          "Thank you! We'll contact you within 24 hours to schedule your consultation. You can also book directly using our calendar link above.",
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          studyField: "",
          currentEducation: "",
          preferredIntake: "",
          message: "",
        });
        
        // Optionally redirect to calendar booking
        setTimeout(() => {
          window.open("https://calendly.com/nextwave-admissionsinuae/30min", "_blank");
        }, 2000);
      } else {
        throw new Error('Failed to submit consultation request');
      }
    } catch (error) {
      alert('There was an error submitting your request. Please try again or contact us directly at nextwaveadmission@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="consultation-form" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-secondary/20 rounded-full text-secondary font-bold mb-6 text-sm">
              <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
              Free Consultation
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Let's Find Your Perfect{" "}
              <span className="text-primary">UAE University</span>
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Fill out this form and we'll schedule a free consultation to
              discuss your study abroad goals.
            </p>
            <div className="text-center">
              <a
                href="https://calendly.com/nextwave-admissionsinuae/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-secondary text-black font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 mb-4"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Directly on Calendar
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your.email@example.com"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    WhatsApp Number *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+971 50 123 4567"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Study *
                  </label>
                  <Select
                    value={formData.studyField}
                    onValueChange={(value) =>
                      setFormData({ ...formData, studyField: value })
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary">
                      <SelectValue placeholder="Select your field" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {field}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Education Level
                  </label>
                  <Input
                    type="text"
                    value={formData.currentEducation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentEducation: e.target.value,
                      })
                    }
                    placeholder="e.g., High School Graduate, Bachelor's"
                    className="border-gray-300 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Preferred Intake
                  </label>
                  <Select
                    value={formData.preferredIntake}
                    onValueChange={(value) =>
                      setFormData({ ...formData, preferredIntake: value })
                    }
                  >
                    <SelectTrigger className="border-gray-300 focus:border-primary">
                      <SelectValue placeholder="When do you want to start?" />
                    </SelectTrigger>
                    <SelectContent>
                      {intakes.map((intake) => (
                        <SelectItem key={intake} value={intake}>
                          {intake}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us about your goals, preferences, or any questions you have..."
                  rows={4}
                  className="border-gray-300 focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary hover:bg-yellow-400 text-black font-bold py-3 text-lg"
              >
                {isSubmitting
                  ? "Booking Your Consultation..."
                  : "Book Free Consultation"}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                We'll contact you within 24 hours to schedule your consultation.
                All consultations are completely free with no obligations.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
