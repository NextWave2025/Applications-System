import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Star, Clock, MapPin, DollarSign } from "lucide-react";
import { type ProgramWithUniversity } from "@shared/schema";
import PriceDisplay from "@/components/price-display";
import CurrencyConverter from "@/components/currency-converter";
import { useAuth } from "../hooks/use-auth";
import { storeResumeData, createQuickApplyResumeData } from "../lib/resume-flow";

interface ProgramCardNewProps {
  program: ProgramWithUniversity;
  isSelected?: boolean;
  onSelectionChange?: (programId: number, selected: boolean) => void;
  showSelection?: boolean;
}

// QuickApplyButton component with resume flow integration
function QuickApplyButton({ program }: { program: ProgramWithUniversity }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleQuickApply = () => {
    if (!user) {
      // Store resume data before redirecting to auth
      const resumeData = createQuickApplyResumeData(
        program.id.toString(),
        program.name,
        program.university?.name
      );
      storeResumeData(resumeData);
      console.log("Quick Apply button - stored resume data:", resumeData);
      
      // Store redirect URL for after authentication
      localStorage.setItem("redirectTo", `/apply/${program.id}?mode=quick&from=card`);
      
      // Redirect to student auth page for quick apply
      setLocation("/auth/student");
    } else {
      // Redirect to application form in Quick Apply mode
      setLocation(`/apply/${program.id}?mode=quick&from=card`);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="px-4 py-2.5 border-secondary bg-secondary text-black hover:bg-yellow-400 font-semibold text-sm w-full sm:w-auto transition-all duration-300"
      onClick={handleQuickApply}
    >
      Quick Apply
    </Button>
  );
}

export default function ProgramCardNew({ 
  program, 
  isSelected = false, 
  onSelectionChange, 
  showSelection = false 
}: ProgramCardNewProps) {
  
  const getTuitionAmount = (tuition: string): number | null => {
    if (!tuition || tuition === "0 AED/year") {
      return null;
    }
    // Extract numbers from string to handle different formats
    const numericValue = tuition.replace(/[^0-9]/g, '');
    if (numericValue && numericValue !== "0") {
      return parseInt(numericValue);
    }
    return null;
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "Duration not specified";
    return duration.replace(/years?/g, 'years').replace(/year$/g, 'years');
  };

  const formatIntake = (intake: string) => {
    if (!intake) return "Contact for intake";
    return intake;
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onSelectionChange) {
      onSelectionChange(program.id, e.target.checked);
    }
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
      isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Selection checkbox */}
      {showSelection && (
        <div className="absolute top-4 right-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* University header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mr-3 flex items-center justify-center shadow-sm">
              {program.university?.imageUrl ? (
                <img
                  src={program.university.imageUrl}
                  alt={program.university.name}
                  className="w-7 h-7 object-contain"
                />
              ) : (
                <BookOpen className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {program.university?.name || 'University'}
              </p>
              <p className="text-xs text-gray-500">
                {program.university?.location || 'UAE'}
              </p>
            </div>
          </div>
          {program.hasScholarship && (
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">
              <Star className="w-3 h-3 mr-1" />
              Scholarship
            </Badge>
          )}
        </div>

        {/* Program title */}
        <h3 className="text-lg sm:text-xl font-bold text-primary mb-4 line-clamp-2 leading-tight">
          {program.name}
        </h3>

        {/* Program details */}
        <div className="space-y-2.5 mb-5">
          {/* Degree level */}
          <div className="flex items-center text-sm text-gray-700">
            <BookOpen className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
            <span className="font-medium">{program.degree || "Degree"}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center text-sm text-gray-700">
            <Clock className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
            <span>{formatDuration(program.duration)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
            <span>{program.university?.location || 'UAE'}</span>
          </div>

          {/* Tuition fee */}
          <div className="flex items-start text-sm">
            <DollarSign className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              {getTuitionAmount(program.tuition) ? (
                <>
                  <PriceDisplay 
                    amountInAED={getTuitionAmount(program.tuition)!} 
                    size="md"
                    className="font-bold text-gray-900"
                  />
                  <CurrencyConverter
                    amount={getTuitionAmount(program.tuition)!}
                    fromCurrency="AED"
                    variant="compact"
                    className="mt-1"
                  />
                </>
              ) : (
                <span className="font-bold text-gray-900 text-base">Contact for pricing</span>
              )}
            </div>
          </div>
        </div>

        {/* Intake badge */}
        <div className="mb-5">
          <Badge variant="outline" className="text-xs font-medium">
            Next Intake: {formatIntake(program.intake)}
          </Badge>
        </div>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href={`/programs/${program.id}`} className="flex-1">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-4 text-sm transition-all duration-300"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <QuickApplyButton program={program} />
        </div>
      </div>
    </div>
  );
}