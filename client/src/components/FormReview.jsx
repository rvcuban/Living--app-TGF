const [showReviewForm, setShowReviewForm] = useState(false);
const [rating, setRating] = useState(0);
const [comment, setComment] = useState("");

const handleReviewSubmit = async () => {
    const res = await fetch(`/api/review/createReview`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
            listingId: listing._id,
            rating,
            comment,
        }),
    });

    const data = await res.json();
    if (res.ok) {
        setListing((prevListing) => ({
            ...prevListing,
            reviews: [...prevListing.reviews, data],
        }));
        setShowReviewForm(false); // Ocultar el formulario después de enviar
    }
};

{showReviewForm && (
    <div className="mt-4">
        <h3 className="text-lg font-semibold">Add Your Review</h3>
        <div className="mt-2">
            <label>Rating:</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>{value}</option>
                ))}
            </select>
        </div>
        <div className="mt-2">
            <label>Comment:</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <button onClick={handleReviewSubmit} className="bg-green-500 text-white px-4 py-2 rounded mt-4">Submit Review</button>
    </div>
)}
