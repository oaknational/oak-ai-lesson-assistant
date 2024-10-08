The following sequence diagram visualises a user completing Aila's lesson plan creation process.

```mermaid
	sequenceDiagram
		actor User
		participant Web App
		participant Aila
		participant Cache
		participant db as Database
		participant LLM
        participant mod as ModerationLLM
        participant Cohere

	User->>Web App: Inputs a subject, key stage or title of a lesson they want to teach
	activate Web App
	Web App->>Aila: Creates a new Aila chat with skeleton lesson plan
	activate Aila
	Aila->>db: Saves initial lesson plan (user state)
	Aila->>Aila: Opens chat stream
	activate db
    Aila->>LLM: Asks LLM to categorise initial lesson prompt
    activate LLM
    LLM-->>Aila: Returns categorisation for key stage and subject
    deactivate LLM
	Aila->>db: Asks for relevant lesson plans using categorisation
	activate db
	Note right of db: Uses generated vector embeddings
	db-->>Aila: Returns relevant lesson plans
    deactivate db
    Aila->>Cohere: Uses Cohere to rank lesson plans by similarity
    Cohere-->>Aila: Returns top 5 lesson plans
    Aila->>Aila: Set top 5 relevant lesson plans for context on lesson plan
    Aila->>Cache: Cache user lesson plan
	Aila->>Web App: Show categorisation (key stage and subject) (RHS) and top 5 relevant lesson plans (LHS)
	Web App->>Aila: Closes chat stream
	deactivate Aila
	alt User selects a relevant lesson as the lesson base
		User->>Web App: User selects existing lesson
        Web App->>Aila: Set basedOn in lesson plan to selected lesson
	else No relevant lessons or user chooses not to select
		User->>Web App: User gives another prompt or 'Continues'
	end
	Web App->>Aila: New chat stream
	activate Aila
    Aila->>Cache: Get lesson plan from cache
    activate Cache
    Cache-->>Aila: Returns lesson plan
    deactivate Cache
	Aila->>Aila: Opens chat stream
	Aila->>LLM: Generates responses (moving through lesson plan template)
	activate LLM
	LLM-->>Aila: Returns lesson plan response as JSON structured output
	deactivate LLM
	Aila->>Aila: Uses JSON patch protocol to update lesson plan
	Aila->>mod: Moderates messages and checks for violations
	activate mod
	mod-->>Aila: Returns moderation response
	deactivate mod
    Aila->>db: Updates lesson plan
    activate db
    deactivate db
	Aila->>Web App: Displays lesson plan (RHS) and any follow up prompts (including moderation) (LHS)
	Note right of Web App: Updates can be made to the lesson plan indefinitely
	opt Streaming ends
	Web App->>Aila: Closes chat stream
	end
	opt Lesson plan complete (all sections complete)
	Note right of Web App: Exports and sharing are handled by the web app
	User->>Web App: Requests export
	Web App->>db: Requests completed lesson plan
	activate db
    db-->>Web App: Returns completed lesson plan
    deactivate db
	Web App->>Web App: Exports generated
	end
	deactivate Aila
	deactivate Web App
```