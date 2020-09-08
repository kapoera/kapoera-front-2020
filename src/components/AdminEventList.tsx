import React, { useState, useContext, useEffect } from 'react';
import { Accordion, AccordionTitleProps } from 'semantic-ui-react';
import AdminEventForm from '@/components/AdminEventForm';
import { GlobalContext } from '@/context';
import axios from '@/utils/axios';
import { EventType, EventListProps } from '@/components/EventList'

const defaultEvent: EventType[] = [
    {
        game_type: 'default',
        answer: 'a',
        choices: [],
        responses: [],
        name: 'default',
        key: -1
    }
];

const AdminEventList: React.FC<EventListProps> = ({ gameId }: EventListProps) => {
    const [activeIndex, setActiveIndex] = useState(-1);
    const handleClick = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        titleProps: AccordionTitleProps
    ) => {
        const { index } = titleProps;
        const newIndex = (activeIndex === index ? -1 : index) as number;
        setActiveIndex(newIndex);
    };
    const [events, setEvents] = useState(defaultEvent);
    const { state } = useContext(GlobalContext);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data }: { data: EventType[] } = await axios.get(
                `/api/events/${gameId}`
            );
            setEvents(data);
        };

        fetchEvents();
    }, []);

    return (
        <div>
            <Accordion styled fluid>
                {events.map((event, key) => (
                    <div key={key}>
                        <Accordion.Title
                            active={activeIndex === key}
                            index={key}
                            onClick={handleClick}
                        >
                            {event.name}
                        </Accordion.Title>
                        <Accordion.Content active={activeIndex === key}>
                            <AdminEventForm
                                isLoggedIn={state.isLoggedIn}
                                event={event}
                                setEvents={setEvents}
                                game_type={gameId}
                            />
                        </Accordion.Content>
                    </div>
                ))}
            </Accordion>
        </div>
    );
};

export default AdminEventList;
