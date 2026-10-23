import { StarIcon } from "lucide-react";
import Marquee from "react-fast-marquee";

interface Testimonial {
    review: string;
    name: string;
    rating: number;
    image: string;
}

export default function Testimonials() {
    const data: Testimonial[] = [
        {
            review:
                "Super clean and easy to use. These AI-generated components saved me hours of dev time and countless lines of extra code!",
            name: "Aarav Sharma",
            rating: 5,
            image: "/assets/testimonials/avatar-1.jpg",
        },
        {
            review:
                "The design quality is top-notch. Perfect balance between simplicity and style. Highly recommend for any creative developer!",
            name: "Priya Patel",
            rating: 5,
            image: "/assets/testimonials/avatar-2.jpg",
        },
        {
            review:
                "Absolutely love the reusability of these components. My workflow feels 10x faster now with cleaner and more consistent layouts.",
            name: "Rohan Verma",
            rating: 5,
            image: "/assets/testimonials/avatar-3.jpg",
        },
        {
            review:
                "Clean, elegant, and efficient. These components are a dream for any modern web developer who values beautiful code.",
            name: "Ananya Iyer",
            rating: 5,
            image: "/assets/testimonials/avatar-4.jpg",
        },
        {
            review:
                "I've tried dozens of UI kits, but this one just feels right. Everything works seamlessly and looks incredibly polished.",
            name: "Vikram Malhotra",
            rating: 5,
            image: "/assets/testimonials/avatar-5.jpg",
        },
        {
            review:
                "Brilliantly structured components with clean, modern styling. Makes development a joy and design updates super quick.",
            name: "Sneha Kulkarni",
            rating: 5,
            image: "/assets/testimonials/avatar-6.jpg",
        },
    ];

    return (
        <section className="flex flex-col items-center justify-between max-w-6xl mx-auto mt-32 px-4">
            <h3 className="font-domine text-3xl text-slate-100">OUR TESTIMONIALS</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400 max-w-md text-center">
                We&apos;ve been using our product for over a year and have received
                overwhelmingly positive feedback from our customers.
            </p>

            <Marquee pauseOnHover className="mt-16" gradient gradientColor="#000" speed={30}>
                {data.map((item, index) => (
                    <TestimonialCard key={index} item={item} />
                ))}
            </Marquee>
            <Marquee pauseOnHover className="mt-6" direction="right" gradient gradientColor="#000" speed={30}>
                {data.map((item, index) => (
                    <TestimonialCard key={index} item={item} />
                ))}
            </Marquee>
        </section>
    );
}

function TestimonialCard({ item }: { item: Testimonial }) {
    return (
        <div className="w-full max-w-[352px] mx-2 space-y-4 rounded-md border border-white/10 bg-white/[0.03] p-3 text-slate-400">
            <div className="flex items-center">
                <div className="flex gap-1">
                    {[...Array(item.rating)].map((_, index) => (
                        <StarIcon
                            key={index}
                            className="w-4 h-4 fill-slate-200 text-slate-200"
                        />
                    ))}
                </div>
            </div>

            <p>&ldquo;{item.review}&rdquo;</p>

            <div className="flex items-center gap-2 pt-3">
                <img
                    className="w-8 h-8 rounded-full object-cover"
                    width={40}
                    height={40}
                    src={item.image}
                    alt={item.name}
                />
                <p className="font-medium text-slate-100">{item.name}</p>
            </div>
        </div>
    );
}
