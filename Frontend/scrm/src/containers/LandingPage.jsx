import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = ["img/coding1.jpg", "img/coding2.jpg"];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      {/* Carousel Images - Add left padding to make room for the sidebar button */}
      <div className="absolute inset-0 pl-16">
        {/* Added pl-16 for left padding */}
        {slides.map((slide, index) => (
          <div
            key={slide}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-full w-full relative flex justify-center items-center">
              <img
                src={slide}
                alt={`Slide ${index + 1}`}
                className="h-3/4 w-full object-center"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Content - Also add padding to align with the images */}
      <div className="absolute inset-0 pl-16 flex flex-col items-center justify-center z-10 text-center px-4">
        <div className="max-w-xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
            Welcome to CodeNexus
          </h1>
          <p className="text-white text-lg md:text-xl">
            Connect, collaborate, and code your way to success. Join our
            community and unlock your full potential.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Navigation */}
      <div className="absolute bottom-8 w-full flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${
              currentSlide === index ? "bg-white" : "bg-gray-400 bg-opacity-50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Arrow Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-20 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 rounded-full p-2 text-white z-20 hover:bg-opacity-50"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 rounded-full p-2 text-white z-20 hover:bg-opacity-50"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}

export default LandingPage;
