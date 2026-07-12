import "./ResourceBooking.css";

export default function ResourceBooking() {

  const slots = [
    {
      id: 1,
      time: "09:00",
      title: "Booked - Procurement Team",
      duration: "09:00 - 10:00",
      type: "booked",
    },
    {
      id: 2,
      time: "09:30",
      title: "Requested 09:30 - 10:30",
      duration: "Conflict - Slot unavailable",
      type: "conflict",
    },
    {
      id: 3,
      time: "10:00",
      title: "",
      duration: "",
      type: "empty",
    },
    {
      id: 4,
      time: "11:00",
      title: "",
      duration: "",
      type: "empty",
    },
    {
      id: 5,
      time: "12:00",
      title: "",
      duration: "",
      type: "empty",
    },
    {
      id: 6,
      time: "01:00",
      title: "",
      duration: "",
      type: "empty",
    },
  ];

  return (
    <div className="booking-page">

      <h1>Resource Booking</h1>

      <div className="resource-box">

        <label>Resource</label>

        <input
          value="Conference Room B2 - Tue, 7 Jul"
          readOnly
        />

      </div>

      <div className="timeline">

        {slots.map((slot) => (

          <div
            className="slot-row"
            key={slot.id}
          >

            <div className="time">
              {slot.time}
            </div>

            <div
              className={`slot ${slot.type}`}
            >

              <strong>
                {slot.title}
              </strong>

              <p>
                {slot.duration}
              </p>

            </div>

          </div>

        ))}

      </div>

      <button className="success-btn">
        Book a Slot
      </button>

    </div>
  );
}