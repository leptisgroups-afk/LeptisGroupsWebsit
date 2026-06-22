const projects = [
    {
        id: 2,
        title: "Leptis Hypermarket SHOPPING CENTER AL AIN ",
        image: "/AlAin.jpeg ",
    },
    {
        id: 3,
        title: "Spice Village Restaurant",
        image: "/pro3.jpg",
    },
    {
        id: 4,
        title: "Leptis Fresh AI Marjan",
        image: "/pro4.jpg",
    },
    {
        id: 5,
        title: "LASSI HOME",
        image: "/pr5.jpg",
    },
];

const wholeProjects = [
    {
        id: 2,
        title: "Leptis Hypermarket Ajman",
        image: [
            {
                image: "/pro2-2.jpg",
                title: "Leptis Hypermarket Ajman",
            },
            {
                image: "/pro2-3.jpg",
                title: "Leptis Hypermarket Ajman",
            },
            {
                image: "/pro2-4.jpg",
                title: "Leptis Hypermarket Ajman",
            },
        ]
    },
    {
        id: 3,
        title: "Spice Village Restaurant",
        image: [
            {
                image: "/pro3-2.jpg",
                title: "Spice Village",
            },
            {
                image: "/pro3-3.jpg",
                title: "Spice Village",
            },
            {
                image: "/pro3-4.jpg",
                title: "Spice Village",
            },
        ]
    },
    {
        id: 4,
        title: "Leptis Fresh AI Marjan",
        image: [
            {
                image: "/pro4-2.jpg",
                title: "Leptis Fresh AI Marjan",
            },
            {
                image: "/pro4-3.jpg",
                title: "Leptis Fresh",
            },
            {
                image: "/pro4-4.jpg",
                title: "Leptis Fresh",
            },
            {
                image: "/pro4-5.jpg",
                title: "Leptis Fresh",
            },
        ]
    },
    {
        id: 5,
        title: "Mecalo",
        image: [
            {
                image: "/pro5-2.jpg",
                title: "Mecalo",
            },
            {
                image: "/pro5-3.jpg",
                title: "Mecalo",
            },
            {
                image: "/pro5-4.jpg",
                title: "Mecalo",
            },
        ]
    },
];

export const fetchProjects = () => {
    return projects;
}

export const fetchSingleProject = (id) => {
    return wholeProjects.find(project => project.id === parseInt(id));
}